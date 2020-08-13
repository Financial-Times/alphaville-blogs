'use strict';

const _ = require('lodash');
const url = require('url');

const emailService = require('../../services/email');
const emailServiceUrl = url.parse(process.env.EMAIL_PLATFORM_API_URL);

const healthCheckModel = {
	id: 'email-service',
	name: 'Email service',
	ok: false,
	technicalSummary: "Used for the curation tool to check the user's email address.",
	severity: 3,
	businessImpact: "Curation tool not accessible.",
	checkOutput: "",
	panicGuide: `Check the healthcheck of the service (https://ep.ft.com/users-lists/__health)`,
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		emailService.getUserData('75ff956e-c349-4a19-aff7-8d6bec8fe690')
			.then(() => {
				currentHealth.ok = true;
				resolve(_.omit(currentHealth, ['checkOutput']));
			})
			.catch((err) => {
				currentHealth.ok = false;
				currentHealth.checkOutput = "Email service API is unreachable. Error: " + (err && err.message ? err.message : '');
				resolve(currentHealth);
			});
	});
};
