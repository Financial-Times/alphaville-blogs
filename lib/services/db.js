'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

function dbConnect() {
	const options = {
		keepAlive: 120,
		useMongoClient: true
	};

	mongoose.connect(process.env.DATABASE_URL || process.env.MONGODB_URI, options);
	return mongoose.connection;
}

/*eslint-disable no-console */
exports.connect = (openCb, errCb) => {
	errCb = errCb || console.log;
	dbConnect()
		.on('error', errCb)
		.on('disconnect', dbConnect)
		.on('open', openCb);
};
/*eslint-enable no-console*/
