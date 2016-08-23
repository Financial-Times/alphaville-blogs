"use strict";

const db = require('./db');
const wpApiBaseUrl = process.env.WP_URL;
const fetch = require('node-fetch');

exports.all = function () {
	return db.any('SELECT * FROM live_sessions').then((results) => {
		return results;
	});
};

exports.latest = function () {
	return db.oneOrNone('SELECT * FROM live_sessions ORDER BY created_at DESC LIMIT 1').then((latestSession) => {
		return latestSession;
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
