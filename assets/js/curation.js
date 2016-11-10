require('./common');
const oDate = require('o-date');
const oCommentCount = require('o-comment-count');
const oAds = require('o-ads');

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
	curationDelegate.on('change', '[name="alphaville-card-curation-type"]', (e) => {
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
							document.querySelector('.alphaville-article-grid .o-grid-row').innerHTML = data.html;
							oDate.init();
							oCommentCount.init();
							oAds.init();
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
						cardContainer.removeChild(spinner);
					}
				}

				if (selectedValue === 'blog') {
					alphavilleUi.utils.httpRequest.get({
						url: `${curationApiUrl}/delete`,
						query: {
							uuid: uuid
						}
					}).then(onSuccess).catch(onFail);
				} else {
					alphavilleUi.utils.httpRequest.get({
						url: `${curationApiUrl}/save`,
						query: {
							uuid: uuid,
							type: selectedValue
						}
					}).then(onSuccess).catch(onFail);
				}
			}
		}
	});

	curationDelegate.on('change', '[name="alphaville-card-curation-hero"]', (e) => {
		const checked = e.target.checked;
		const checkbox = e.target;

		let cardContainer = alphavilleUi.utils.dom.getParents(e.target, '.alphaville-card-container');
		if (cardContainer && cardContainer.length) {
			cardContainer = cardContainer[0];

			const card = cardContainer.querySelector('.alphaville-card');
			if (card) {
				const uuid = card.getAttribute('data-article-id');
				checkbox.setAttribute('disabled', 'disabled');
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
							document.querySelector('.alphaville-article-grid .o-grid-row').innerHTML = data.html;
							oDate.init();
							oCommentCount.init();
							oAds.init();
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
					cardContainer.classList.remove('alphaville-curation--save-in-progress');
					const spinner = cardContainer.querySelector('.alphaville-curation--spinner');
					if (spinner) {
						cardContainer.removeChild(spinner);
					}
				}

				if (!checked) {
					alphavilleUi.utils.httpRequest.get({
						url: `${curationApiUrl}/delete`,
						query: {
							type: 'hero'
						}
					}).then(onSuccess).catch(onFail);
				} else {
					alphavilleUi.utils.httpRequest.get({
						url: `${curationApiUrl}/save`,
						query: {
							uuid: uuid,
							type: 'hero'
						}
					}).then(onSuccess).catch(onFail);
				}
			}
		}
	});

	const standfirstCharLimitInput = document.querySelector('[name="standfirst-char-limit"]');

	curationDelegate.on('click', '[name="save-standfirst-char-limit"]', () => {
		console.log(standfirstCharLimitInput.value);

		const cardContainers = document.querySelectorAll('.alphaville-card-container');
		if (cardContainers && cardContainers.length) {
			for (let i = 0; i < cardContainers.length; i++) {
				const cardContainer = cardContainers[i];

				const card = cardContainer.querySelector('.alphaville-card');
				if (card) {
					cardContainer.classList.add('alphaville-curation--save-in-progress');
					cardContainer.appendChild(alphavilleUi.utils.dom.toDOM(`
						<div class="alphaville-curation--spinner"></div>
					`));
				}
			}


			function onSuccess (data) {
				if (typeof data === 'string') {
					data = JSON.parse(data);
				}

				if (data.status === 'ok') {
					for (let i = 0; i < cardContainers.length; i++) {
						const cardContainer = cardContainers[i];
						cardContainer.classList.remove('alphaville-curation--save-in-progress');
						cardContainer.removeChild(cardContainer.querySelector('.alphaville-curation--spinner'));
					}

					if (data.html) {
						document.querySelector('.alphaville-article-grid .o-grid-row').innerHTML = data.html;
						oDate.init();
						oCommentCount.init();
						oAds.init();
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

				for (let i = 0; i < cardContainers.length; i++) {
					const cardContainer = cardContainers[i];

					cardContainer.classList.remove('alphaville-curation--save-in-progress');
					const spinner = cardContainer.querySelector('.alphaville-curation--spinner');
					if (spinner) {
						cardContainer.removeChild(spinner);
					}
				}
			}

			alphavilleUi.utils.httpRequest.get({
				url: `${curationApiUrl}/standfirst-char-limit`,
				query: {
					value: standfirstCharLimitInput.value
				}
			}).then(onSuccess).catch(onFail);
		}
	});
});

require('o-autoinit');
