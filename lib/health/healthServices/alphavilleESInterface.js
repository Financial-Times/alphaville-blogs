'use strict';

const fetch = require('node-fetch');
const _ = require('lodash');

const healthCheckModel = {
	id: 'alphaville-es-interface',
	name: 'Alphaville Elastic Search interface',
	ok: false,
	technicalSummary: "Alphaville ES interface is used to fetch any content.",
	severity: 1,
	businessImpact: "The application will be down, no content will be served.",
	checkOutput: "",
	panicGuide: `Check the healthcheck of the service (https://${process.env['AV_ES_SERVICE_URL']}/__health)`,
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		fetch(`https://${process.env['AV_ES_SERVICE_URL']}/v2/article/5eaca661-fd34-3244-b819-fb74cee54021`, {headers: {'X-API-KEY': process.env['AV_ES_SERVICE_KEY']}})
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
				currentHealth.checkOutput = "Alphaville ES interface service is unreachable. Error: " + (err && err.message ? err.message : '');
				resolve(currentHealth);
			});
	});
};
