"use strict";

"use strict";

const _ = require('lodash');
require('../../services/db');
require('../../dbModels');
const DBHealthModel = require('../../dbModels/DBHealth');

const healthCheckModel = {
	id: 'worker',
	name: 'Worker',
	ok: false,
	technicalSummary: "Worker maintains ML live sessions.",
	severity: 2,
	businessImpact: "Live ML sessions will not be reflected in the header/notification.",
	checkOutput: "",
	panicGuide: "",
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		DBHealthModel.findOne().exec().then((dbHealth) => {
			if (dbHealth.status === true && (new Date().getTime() - dbHealth.lastUpdated < 120000)) {
				currentHealth.ok = true;
				resolve(_.omit(currentHealth, ['checkOutput']));
			} else {
				throw new Error("Worker health update timeout.");
			}
		}).catch((err) => {
			currentHealth.ok = false;
			currentHealth.checkOutput = "Worker is offline. See the logs of the application on heroku. Error: " + (err && err.message ? err.message : '');
			resolve(currentHealth);
		});

		// timeout after 10 seconds
		setTimeout(function () {
			currentHealth.ok = false;
			currentHealth.checkOutput = 'timeout';
			resolve(currentHealth);
		}, 10000);
	});
};
