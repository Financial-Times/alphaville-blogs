'use strict';

const fetch = require('node-fetch');
const _ = require('lodash');

const healthCheckModel = {
	id: 'wordpress-json-api',
	name: 'Wordpress JSON API',
	ok: false,
	technicalSummary: "Wordpress JSON API serves information for static pages and meet the team page.",
	severity: 3,
	businessImpact: "About page and meet the team page are not be available.",
	checkOutput: "",
	panicGuide: "",
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		fetch(`${process.env['PROD_WP_URL']}/about-alphaville-2/?json=1&api_key=${process.env['WP_API_KEY']}`)
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					const error = new Error(res.statusText);
					error.response = res;
					throw error;
				}
			})
			.then(() => {
				currentHealth.ok = true;
				resolve(_.omit(currentHealth, ['checkOutput']));
			})
			.catch((err) => {
				currentHealth.ok = false;
				currentHealth.checkOutput = "Wordpress API is unreachable or the required page is not available. Error: " + (err && err.message ? err.message : '');
				resolve(currentHealth);
			});
	});
};
