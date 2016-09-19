const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LiveSessionSchema = new Schema({
	sessionId: {
		type: String,
		index: true
	},
	url: String,
	createdAt: {
		type: Date,
		index: true
	}
});

LiveSessionSchema.index({sessionId: 1, createdAt: 1});
LiveSessionSchema.index({sessionId: 1, createdAt: -1});
LiveSessionSchema.set('versionKey', false);
module.exports = mongoose.model('LiveSession', LiveSessionSchema);
