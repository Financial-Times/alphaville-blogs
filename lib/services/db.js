'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

function dbConnect() {
	const options = {
		server: {
			socketOptions: {
				keepAlive: 120
			}
		}
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
