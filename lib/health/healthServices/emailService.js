'use strict';

const _ = require('lodash');
const emailService = require('../../services/email');

const healthCheckModel = {
	id: 'email-service',
	name: 'Email service',
	ok: false,
	technicalSummary: "Used for the curation tool to check the user's email address.",
	severity: 3,
	businessImpact: "Curation tool not accessible.",
	checkOutput: "",
	panicGuide: "",
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		emailService.getUserData('3f330864-1c0f-443e-a6b3-cf8a3b536a52')
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
