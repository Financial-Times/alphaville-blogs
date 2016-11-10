const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const standfirstCharLimitSchema = new Schema({
	type: {
		type: String,
		index: true
	},
	value: {
		type: Number,
		index: true
	}
});

standfirstCharLimitSchema.pre('save', function (next) {
	next();
});

standfirstCharLimitSchema.set('versionKey', false);
module.exports = mongoose.model('StandfirstCharLimit', standfirstCharLimitSchema);
