require('./common');
require('alphaville-marketslive-chat');
require('./ml-pageBackground');
require('o-tabs');

exports.Webchat = require('webchat');

exports.marketsLiveSessionNotification = require('alphaville-ui')['marketslive-session-notification'];
exports.marketsLiveSessionNotification.disableNotification();

require('o-autoinit');
