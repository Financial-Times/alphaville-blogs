require('./common');
require('alphaville-marketslive-chat');
require('./ml-pageBackground');
require('o-tabs');
const Scroller = require('./utils/Scroller');
const mlEditor = require('./lib/mlEditor');

exports.Webchat = require('webchat');

exports.marketsLiveSessionNotification = require('alphaville-ui')['marketslive-session-notification'];
exports.marketsLiveSessionNotification.disableNotification();

document.addEventListener('o.DOMContentLoaded', () => {
	const mlTabsContainer = document.querySelector('.ml-tabs-container');
	const stickyHeader = document.querySelector('.alphaville-header--sticky');

	const scroller = new Scroller(document.body, () => {
		if (stickyHeader.classList.contains('o-header--sticky-active') && !mlTabsContainer.classList.contains('ml-tabs-container--sticky')) {
			mlTabsContainer.classList.add('ml-tabs-container--sticky');
			mlTabsContainer.style.top = stickyHeader.clientHeight + 'px';
		}

		if (!stickyHeader.classList.contains('o-header--sticky-active') && mlTabsContainer.classList.contains('ml-tabs-container--sticky')) {
			mlTabsContainer.classList.remove('ml-tabs-container--sticky');
			mlTabsContainer.style.top = 'auto';
		}
	});
	scroller.start();
});

require('o-autoinit');
