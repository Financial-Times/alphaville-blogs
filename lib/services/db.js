'use strict';

const mongoose = require('mongoose');

function dbConnect() {
	let options = {
		server: {
			socketOptions: {
				keepAlive: 120
			}
		}
	};

	const mongoose = require('mongoose');
	mongoose.Promise = global.Promise;
	mongoose.connect(process.env.DATABASE_URL || process.env.MONGODB_URI);
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
