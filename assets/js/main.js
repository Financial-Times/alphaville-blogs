require('./common');
require('o-comments');
require('o-comment-count');

const oDate = require('o-date');
const InfiniteScroll = require('alphaville-ui').InfiniteScroll;

document.addEventListener('o.DOMContentLoaded', function () {
	new InfiniteScroll({
		pageParamName: 'page',
		container: '.alphaville-infinite-scroll-container',
		onNewPage: () => {
			oDate.init();
		}
	});
});

require('o-autoinit');
