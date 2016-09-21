const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const curationSchema = new Schema({
	articleId: {
		type: String,
		index: true,
		unique: true
	},
	type: {
		type: String,
		index: true
	}
});

curationSchema.set('versionKey', false);
module.exports = mongoose.model('Curation', curationSchema);
