"use strict";

if (!process.env.RESTRICTED_ACCESS_USERS) {
	throw new Error('Missing the required RESTRICTED_ACCESS_USERS env var');
}

const sessionApiService = require('../services/sessionApi');
const allowedUsers = process.env.RESTRICTED_ACCESS_USERS.split(',')

module.exports = async function (req, res, next) {
	const onFail = function (err) {
		if (err) {
			console.log(err);
		}

		const error = new Error("Permission denied.");
		error.status = 401;
		next(error);
	};

	if (req.cookies.FTSession) {
		try {
			const sessionId = req.cookies.FTSession;
			const {uuid} = await sessionApiService.getSessionData(sessionId);

			return allowedUsers.includes(uuid) ? next() : onFail();
		} catch (error) {
			return onFail(error);
		}
	} else {
		return onFail();
	}
};
