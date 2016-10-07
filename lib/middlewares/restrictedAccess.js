"use strict";

const SessionModel = require('../dbModels/Session');
const UsersAllowedRestrictedModel = require('../dbModels/UsersAllowedRestricted');
const sessionApiService = require('../services/sessionApi');
const emailService = require('../services/email');

module.exports = function (req, res, next) {
	const onFail = function (err) {
		if (err) {
			console.log(err);
		}

		const error = new Error("Permission denied.");
		error.status = 401;
		next(error);
	};

	const decision = function (data) {
		UsersAllowedRestrictedModel.findOne({
			email: data.email
		})
		.exec()
		.then((user) => {
			if (user) {
				next();
			} else {
				onFail();
			}
		}).catch(onFail);
	};

	if (req.cookies.FTSession) {
		const sessionId = req.cookies.FTSession;

		const cacheNotFound = function () {
			sessionApiService.getSessionData(sessionId).then((sessionData) => {
				emailService.getUserData(sessionData.uuid).then((userData) => {
					const model = new SessionModel({
						sessionId: sessionId,
						rememberMe: sessionData.rememberMe,
						userId: sessionData.uuid,
						email: userData.email,
						createdAt: new Date(sessionData.creationTime)
					});

					decision({
						sessionId: sessionId,
						rememberMe: sessionData.rememberMe,
						userId: sessionData.uuid,
						email: userData.email
					});

					model.save().catch((err) => {
						console.log('Error saving user cache.', err);
					});
				}).catch(onFail);
			}).catch(onFail);
		};

		SessionModel.findOne({
			sessionId: sessionId
		}).then((data) => {
			if (data) {
				decision(data);
			} else {
				cacheNotFound();
			}
		}).catch(onFail);
	} else {
		onFail();
	}
};
