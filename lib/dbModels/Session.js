const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const day1 = 24 * 60 * 60 * 1000;
const month6 = 6 * 30 * 24 * 60 * 60 * 1000;

const sessionSchema = new Schema({
	sessionId: {
		type: String,
		index: true,
		required: true
	},
	rememberMe: {
		type: Boolean,
		required: true
	},
	userId: {
		type: String,
		index: true,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		required: true
	},
	expireAt: {
		type: Date,
		default: () => {
			return new Date(new Date().getTime() + day1);
		}
	}
});
sessionSchema.index({
	expireAt: 1
}, {
	expireAfterSeconds: 0
});

sessionSchema.pre('save', function (next) {
	if (this.rememberMe === true) {
		this.expireAt = new Date(this.createdAt.getTime() + month6);
	} else {
		this.expireAt = new Date(this.createdAt.getTime() + day1);
	}

	next();
});

sessionSchema.set('versionKey', false);
module.exports = mongoose.model('Session', sessionSchema);
