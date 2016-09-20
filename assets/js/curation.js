require('./common');
require('o-date');
require('o-comment-count');

const alphavilleUi = require('alphaville-ui');
const Delegate = require('dom-delegate');

const cardTypes = {
	blog: 'Simple',
	opinion: 'Opinion'
};

let template = '<select class="alphaville-card-curation">';
Object.keys(cardTypes).forEach((key) => {
	template += `<option value="${key}">${cardTypes[key]}</option>`;
});
template += '</select>';

const curationApiUrl = '/curation';

document.addEventListener('o.DOMContentLoaded', () => {
	const curationDelegate = new Delegate(document.body);
	curationDelegate.on('change', '.alphaville-card-curation', (e) => {
		const select = e.target;
		const selectedValue = select.options[select.selectedIndex].value;
		let cardContainer = alphavilleUi.utils.dom.getParents(e.target, '.alphaville-card-container');
		if (cardContainer && cardContainer.length) {
			cardContainer = cardContainer[0];

			const card = cardContainer.querySelector('.alphaville-card');
			if (card) {
				const uuid = card.getAttribute('data-article-id');
				select.setAttribute('disabled', 'disabled');
				cardContainer.classList.add('alphaville-curation--save-in-progress');
				cardContainer.appendChild(alphavilleUi.utils.dom.toDOM(`
					<div class="alphaville-curation--spinner"></div>
				`));

				function onSuccess (data) {
					if (typeof data === 'string') {
						data = JSON.parse(data);
					}

					if (data.status === 'ok') {
						cardContainer.classList.remove('alphaville-curation--save-in-progress');
						cardContainer.removeChild(cardContainer.querySelector('.alphaville-curation--spinner'));

						if (data.html) {
							const domObj = alphavilleUi.utils.dom.toDOM(data.html);
							cardContainer.innerHTML = domObj.querySelector('.alphaville-card-container').innerHTML;
						} else {
							new alphavilleUi.AlertOverlay('Warning', `
								The data has been saved, but for some reason the card could not be updated.<br/>
								Please refresh the page to see the updated cards.
							`);
						}
					} else {
						onFail(data);
					}
				}

				function onFail (err) {
					new alphavilleUi.AlertOverlay('Error', err.msg || "An error occured.");
					select.querySelector('[selected]').removeAttribute('selected');
					select.querySelector(`[value="${select.getAttribute('data-last-selected')}"]`).setAttribute('selected', 'selected');
					select.removeAttribute('disabled');
					cardContainer.classList.remove('alphaville-curation--save-in-progress');
					const spinner = cardContainer.querySelector('.alphaville-curation--spinner');
					if (spinner) {
						cardContainer.removeChild();
					}
				}

				if (selectedValue === 'blog') {
					alphavilleUi.utils.httpRequest.post({
						url: `${curationApiUrl}/delete`,
						body: {
							uuid: uuid
						}
					}).then(onSuccess).catch(onFail);
				} else {
					alphavilleUi.utils.httpRequest.post({
						url: `${curationApiUrl}/save`,
						body: {
							uuid: uuid,
							type: selectedValue
						}
					}).then(onSuccess).catch(onFail);
				}
			}
		}
	});
});

require('o-autoinit');
