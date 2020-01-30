"use strict";

const fetch = require('node-fetch');

exports.getUserData = function (userId) {
	const options = {
		headers: {
			'Authorization': `Basic ${new Buffer(process.env.EMAIL_SERVICE_AUTH_USER + ':' + process.env.EMAIL_SERVICE_AUTH_PASS).toString('base64')}`
		}
	};

	let url = `${process.env.EMAIL_PLATFORM_API_URL}/${userId}`;

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
