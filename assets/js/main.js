require('./common');
require('o-comments');
require('o-expander');
const oVideo = require('o-video');
require('o-share');

const oCommentCount = require('o-comment-count');

const oDate = require('o-date');
const alphavilleUi = require('alphaville-ui');
const InfiniteScroll = alphavilleUi.InfiniteScroll;


function checkIfBarrier(html) {
	const tmpDiv = document.createElement('div');
	tmpDiv.innerHTML = html;
	const barrier = tmpDiv.querySelector('.barrier-wrapper');
	if (barrier) {
		return barrier.innerHTML;
	}
	return html;
}

document.addEventListener('o.DOMContentLoaded', function () {
	if (document.querySelector('.alphaville-infinite-scroll-container')) {
		new InfiniteScroll({
			pageParamName: 'page',
			container: '.alphaville-infinite-scroll-container',
			onNewPage: () => {
				oDate.init();
				oCommentCount.init();
			}
		});
	}

	document.addEventListener('oExpander.expand', (evt) => {
		const content = evt.target.querySelector('.o-expander__content');
		if (content.classList.contains('alphaville--read-more__content') && !content.innerHTML) {
			content.innerHTML = `
				<div class="alphaville-spinner"></div>
			`;
			alphavilleUi.utils.httpRequest.get({
				url: evt.target.getAttribute('data-article-url'),
				query: {
					ajax: true
				}
			}).then((html) => {
				content.innerHTML = checkIfBarrier(html);

				oVideo.init();
				if (window.twttr) {
					window.twttr.widgets.load();
				}
			}).catch((e) => {
				console.log(e);
			});
		}
	});

	document.addEventListener('oExpander.collapse', () => {
	});
});

require('o-autoinit');
