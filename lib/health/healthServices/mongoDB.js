"use strict";

"use strict";

const _ = require('lodash');
require('../../services/db');
require('../../dbModels');
const UsersAllowedRestrictedModel = require('../../dbModels/UsersAllowedRestricted');

const healthCheckModel = {
	id: 'mongodb',
	name: 'Mongo DB connection',
	ok: false,
	technicalSummary: "MongoDB is used for the curation tool and live ML sessions.",
	severity: 2,
	businessImpact: "Curation tool is not available. Live ML sessions will not be reflected in the header/notification.",
	checkOutput: "",
	panicGuide: "See the status on heroku for MongoLAB. If necessary, contact MongoLAB.",
	lastUpdated: new Date().toISOString()
};

exports.getHealth = function () {
	return new Promise((resolve) => {
		const currentHealth = _.clone(healthCheckModel);

		UsersAllowedRestrictedModel.find().exec().then(() => {
			currentHealth.ok = true;
			resolve(_.omit(currentHealth, ['checkOutput']));
		}).catch((err) => {
			currentHealth.ok = false;
			currentHealth.checkOutput = "Connection is down. See the logs of the application on heroku. Error: " + (err && err.message ? err.message : '');
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
