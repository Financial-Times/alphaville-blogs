require('./common');

exports.marketsLiveSessionNotification = require('alphaville-ui')['marketslive-session-notification'];
const liveSessionRedirecter = require('./lib/liveSessionRedirecter');
const mlEditor = require('./lib/mlEditor');
const joinMLEditorWithToken = require('./lib/joinMLEditorWithToken');

exports.init = function (mlApiUrl, appUrl) {
	liveSessionRedirecter();
	mlEditor(mlApiUrl, appUrl);
	joinMLEditorWithToken(mlApiUrl).then(joined => {
		if (joined === true) {
			mlEditor(mlApiUrl, appUrl);
		}
	});
};


require('o-autoinit');
