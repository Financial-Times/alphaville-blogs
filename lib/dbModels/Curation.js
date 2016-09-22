const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const curationSchema = new Schema({
	articleId: {
		type: String,
		index: true
	},
	type: {
		type: String,
		index: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 30 * 24 * 60 * 60  // 30 days
	}
});

curationSchema.set('versionKey', false);
module.exports = mongoose.model('Curation', curationSchema);
