const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dbHealth = new Schema({
	status: {
		type: Boolean,
		index: true
	},
	lastUpdated: {
		type: Date
	}
});

dbHealth.set('versionKey', false);
module.exports = mongoose.model('DBHealth', dbHealth);
