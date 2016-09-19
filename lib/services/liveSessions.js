"use strict";

const LiveSession = require('../dbModels/LiveSession');
const wpApiBaseUrl = process.env.WP_URL;
const fetch = require('node-fetch');

exports.all = function () {
	return LiveSession.find({}, {
		_id: 0
	})
	.exec();
};

exports.latest = function () {
	return LiveSession.find({}, {
		_id: 0
	})
	.sort({
		createdAt: 'desc'
	})
	.exec()
	.then(sessions => {
		if (sessions && sessions.length) {
			return sessions[0];
		} else {
			return null;
		}
	});
};

exports.channel = function () {
	return fetch(wpApiBaseUrl + '/notify/channels').then((response) => {
		if (response.status < 200 || response.status >= 400) {
			throw new Error("Request failed");
		}

		return response.json();
	}).then((json) => {
		return {
			channel: json['web-chats'],
			key: json.pusherkey
		};
	});
};
