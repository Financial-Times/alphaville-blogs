const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const liveSessionSchema = new Schema({
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

liveSessionSchema.index({sessionId: 1, createdAt: 1});
liveSessionSchema.index({sessionId: 1, createdAt: -1});
liveSessionSchema.set('versionKey', false);
module.exports = mongoose.model('LiveSession', liveSessionSchema);
