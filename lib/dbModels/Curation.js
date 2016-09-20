const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CurationSchema = new Schema({
	articleId: {
		type: String,
		index: true
	},
	type: {
		type: String,
		index: true
	}
});

CurationSchema.set('versionKey', false);
module.exports = mongoose.model('Curation', CurationSchema);
