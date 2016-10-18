require('./common');
require('o-comments');
require('o-expander');
require('o-video');
require('o-share');
require('./article-series');

const embeddedMedia = require('webchat/src/js/ui/embeddedMedia');
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
		const content = evt.srcElement.querySelector('.o-expander__content');
		if (!content.innerHTML) {
			content.innerHTML = `
				<div class="alphaville-spinner"></div>
			`;
			alphavilleUi.utils.httpRequest.get({
				url: evt.srcElement.getAttribute('data-article-url'),
				query: {
					ajax: true
				}
			}).then((html) => {

				content.innerHTML = checkIfBarrier(html);

				const closedContentContainer = content.querySelector('.webchat-closed-content');

				if (closedContentContainer) {
					embeddedMedia.convert(closedContentContainer);
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
