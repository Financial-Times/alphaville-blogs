"use strict";

const fetch = require('node-fetch');

exports.getUserData = function (userId) {
	const options = {
		headers: {
			'Authorization': `Bearer ${process.env.EMAIL_PLATFORM_API_TOKEN}`
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
