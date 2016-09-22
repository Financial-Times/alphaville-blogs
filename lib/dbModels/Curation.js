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
	expireAt: {
		type: Date,
		default: () => {
			return new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
		}
	}
});

curationSchema.index({
	expireAt: 1
}, {
	expireAfterSeconds: 0
});

curationSchema.pre('save', function (next) {
	this.expireAt = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

	next();
});

curationSchema.set('versionKey', false);
module.exports = mongoose.model('Curation', curationSchema);
