"use strict";

require('../services/db');
require('../dbModels');
const DBHealthModel = require('../dbModels/DBHealth');

const check = function () {
	DBHealthModel.findOneAndUpdate({}, {
		status: true,
		lastUpdated: new Date()
	}, {
		upsert: true
	})
	.exec()
	.catch((err) => {
		console.log("Error", err);
	});

	setTimeout(check, 60000);
};
check();
