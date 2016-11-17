require('./common');
require('o-comments');
require('o-comment-count');
require('o-video');
require('o-share');
require('o-expander');

const oAds = require('alphaville-ui')['o-ads'];

const embeddedMedia = require('webchat/src/js/ui/embeddedMedia');

document.addEventListener('o.DOMContentLoaded', function () {
	const closedContentContainer = document.querySelector('.webchat-closed-content');

	if (closedContentContainer) {
		embeddedMedia.convert(closedContentContainer);
	}

	const inArticleAd1 = document.querySelector('.alphaville-in-article-ad1');
	const inArticleAd2 = document.querySelector('.alphaville-in-article-ad2');
	const isMlTranscript = !!document.querySelector('.webchat-closed-content');

	let linesNumber;

	if (isMlTranscript) {
		linesNumber = document.querySelectorAll('.webchat-closed-content > div.msg');
	} else {
		linesNumber = document.querySelectorAll('.article__body > p');
	}

	if (linesNumber) {
		if (linesNumber.length > 0) {
			if (linesNumber.length > 2) {
				const thirdLine = linesNumber[2];
				thirdLine.parentNode.insertBefore(inArticleAd1, thirdLine.nextSibling);

				if (linesNumber.length > 8) {
					const eighthLine = linesNumber[8];
					eighthLine.parentNode.insertBefore(inArticleAd2, eighthLine.nextSibling);
					inArticleAd2.classList.add('alphaville-in-article-ad--mobile-only');
					oAds.init(inArticleAd2);
				}
			} else {
				const lastLine = linesNumber[linesNumber.length - 1];
				lastLine.parentNode.insertBefore(inArticleAd1, lastLine.nextSibling);
			}
		}
	}

	oAds.init(inArticleAd1);
});

require('o-autoinit');
