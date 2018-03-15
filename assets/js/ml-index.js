require('./common');

exports.marketsLiveSessionNotification = require('alphaville-ui')['marketslive-session-notification'];
const liveSessionRedirecter = require('./lib/liveSessionRedirecter');
const mlEditor = require('./lib/mlEditor');

exports.init = function (mlApiUrl, appUrl) {
	liveSessionRedirecter();
	mlEditor(mlApiUrl, appUrl);
};


require('o-autoinit');
