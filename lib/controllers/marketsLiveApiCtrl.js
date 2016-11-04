"use strict";

const liveSessionService = require('../services/liveSessions');
const cacheHeaders = require('../utils/cacheHeaders');

const sessions = {};

sessions.all = function(req, res) {
	cacheHeaders.setNoCache(res);

	liveSessionService.all().then((results) => {
		res.json({
			status: 'success',
			data: results || []
		});
	}).catch((err) => {
		console.log(err);
		res.json({
			status: 'error',
			error: 'Error fetching the sessions.'
		});
	});
};

sessions.latest = function(req, res) {
	cacheHeaders.setNoCache(res);

	liveSessionService.latest().then((latestSession) => {
		res.json({
			status: 'success',
			data: latestSession || {}
		});
	}).catch((err) => {
		console.log(err);
		res.json({
			status: 'error',
			reason: 'Error fetching the session.'
		});
	});
};

sessions.channel = function (req, res) {
	cacheHeaders.setCache(res, 600);

	liveSessionService.channel().then((channelInfo) => {
		res.json({
			status: 'success',
			data: channelInfo
		});
	}).catch((err) => {
		console.log(err);

		res.json({
			status: 'error',
			reason: 'Error fetching the channel.'
		});
	});
};

exports.sessions = sessions;
