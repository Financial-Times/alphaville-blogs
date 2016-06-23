require('./common');
require('alphaville-header');
require('o-date');
require('o-author-alerts');
require('o-comments');
require('o-comment-count');

const embeddedMedia = require('webchat/src/js/ui/embeddedMedia');

document.addEventListener('o.DOMContentLoaded', function () {
	const closedContentContainer = document.querySelector('.webchat-closed-content');

	if (closedContentContainer) {
		embeddedMedia.convert(closedContentContainer);
	}
});

require('o-autoinit');
