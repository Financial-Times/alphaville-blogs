require('./common');
require('alphaville-header');
require('o-date');
require('o-author-alerts');
require('o-comments');
require('o-comment-count');

const oAds = require('alphaville-ads')['o-ads'];

const embeddedMedia = require('webchat/src/js/ui/embeddedMedia');

document.addEventListener('o.DOMContentLoaded', function () {
	const closedContentContainer = document.querySelector('.webchat-closed-content');

	if (closedContentContainer) {
		embeddedMedia.convert(closedContentContainer);
	}


	const inArticleAd = document.querySelector('.alphaville-in-article-ad');
	const articleBody = document.querySelector('.article__body');

	const pNumber = articleBody.querySelectorAll('p');
	if (pNumber.length > 0) {
		if (pNumber.length > 2) {
			const thirdP = articleBody.querySelector('p:nth-of-type(3)');
			if (thirdP) {
				thirdP.parentNode.insertBefore(inArticleAd, thirdP.nextSibling);
			}
		} else {
			const lastP = articleBody.querySelector('p:last-child');
			if (lastP) {
				lastP.parentNode.insertBefore(inArticleAd, lastP.nextSibling);
			}
		}
	}

	oAds.init(inArticleAd);
});

require('o-autoinit');
