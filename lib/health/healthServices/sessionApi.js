'use strict';

const _ = require('lodash');
const url = require('url');

const sessionApi = require('../../services/sessionApi');
const sessionApiUrl = url.parse(process.env.SESSION_API_URL);

const healthCheckModel = {
	id: 'session-api',
	name: 'Session API',
	ok: false,
	technicalSummary: "Used for the curation tool to check the validity of the session and the user's ID.",
	severity: 3,
	businessImpact: "Curation tool not accessible.",
	checkOutput: "",
	panicGuide: `Check the healthcheck of the service (https://${sessionApiUrl.host}/__health)`,
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		sessionApi.getSessionData('asd')
			.then(() => {
				currentHealth.ok = true;
				resolve(_.omit(currentHealth, ['checkOutput']));
			})
			.catch((err) => {
				if (err && err.response && err.response.status === 404) {
					currentHealth.ok = true;
					resolve(_.omit(currentHealth, ['checkOutput']));
					return;
				}

				currentHealth.ok = false;
				currentHealth.checkOutput = "Session API is unreachable. Error: " + (err && err.message ? err.message : '');
				resolve(currentHealth);
			});
	});
};
