require('./common');
require('o-comments');
const oCommentCount = require('o-comment-count');

const oDate = require('o-date');
const InfiniteScroll = require('alphaville-ui').InfiniteScroll;

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
});

require('o-autoinit');
