"use strict";

const fetch = require('node-fetch');

exports.getSessionData = function (sessionId) {
	const options = {
		headers: {
			'FT_Api_Key': process.env.SESSION_API_KEY
		}
	};

	let url = process.env.SESSION_API_URL;
	url = url.replace(/\{sessionId\}/g, sessionId);

	return fetch(url, options).then((res) => {
		if (res.ok) {
			return res.json();
		} else {
			const error = new Error(res.statusText);
			error.response = res;
			throw error;
		}
	});
};
