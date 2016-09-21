const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersAllowedRestrictedSchema = new Schema({
	email: {
		type: String,
		index: true,
		unique: true
	}
});

usersAllowedRestrictedSchema.set('versionKey', false);
module.exports = mongoose.model('UsersAllowedRestricted', usersAllowedRestrictedSchema);
