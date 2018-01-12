"use strict";

const Pusher = require('pusher-client');
const mlApiBaseUrl = process.env.ML_API_URL;
const fetch = require('node-fetch');

const db = require('../services/db');
require('../dbModels');
const LiveSessionModel = require('../dbModels/LiveSession');
const MLApi = require('alphaville-marketslive-api-client');


const eventsToTryAgain = [];


function onSessionStart (data, retried) {
	console.log('session start', data);

	const url = data.url.replace(/http(s?):\/\/[^\/]+/, '');
	return LiveSessionModel.findOneAndUpdate({
			sessionId: data.uuid
		}, {
			sessionId: data.uuid,
			url: url,
			createdAt: new Date(data.pubdate)
		}, {
			upsert: true
		})
	.exec()
	.catch((err) => {
		console.log('Error starting session.', data.uuid, err);

		if (!retried) {
			eventsToTryAgain.push({
				event: 'session-start',
				data: data
			});
		}

		throw err;
	});
}

function onSessionEnd (data, retried) {
	console.log('session end', data);

	if (!retried) {
		for (let i = 0; i < eventsToTryAgain.length; i++) {
			if (eventsToTryAgain[i].event === 'session-start' && eventsToTryAgain[i].data.uuid === data.uuid) {
				eventsToTryAgain.splice(i, 1);
				break;
			}
		}
	}

	return LiveSessionModel.find({
		sessionId: data.uuid
	})
	.remove()
	.exec()
	.then(() => {
		return fetch(`https://${process.env.CCS_URL}/v1/closeCollection?articleId=${data.uuid}`, {
			headers: {
				'X-Api-Key': process.env.CCS_API_KEY
			}
		}).then((res) => {
			if (res.ok) {
				return res.json();
			} else {
				const error = new Error("Closing Livefyre session failed. " + res.statusText);
				error.response = res;
				throw error;
			}
		}).then((responseJson) => {
			if (responseJson.success === true) {
				console.log("Livefyre session closed for ", data);
				return;
			} else {
				throw new Error("Unexpected response from CCS.");
			}
		}).catch((err) => {
			console.log('Error ending session.', data.uuid, err);

			if (!retried) {
				eventsToTryAgain.push({
					event: 'session-end',
					data: data
				});
			}
		});
	})
	.catch((err) => {
		console.log('Error ending session.', data.uuid, err);

		if (!retried) {
			eventsToTryAgain.push({
				event: 'session-end',
				data: data
			});
		}
	});
}



let waitTime = 500;
function fetchChannels () {
	return fetch(mlApiBaseUrl + '/notify/channels').then((res) => {
		if (res.ok) {
			return res.json();
		} else {
			const error = new Error("Channel fetch failed. " + res.statusText);
			error.response = res;
			throw error;
		}
	}).catch(() => {
		return new Promise((resolve) => {
			setTimeout(() => {
				if (waitTime < 10000) {
					waitTime *= 2;
				}
				fetchChannels().then(resolve);
			}, waitTime);
		});
	});
}

fetchChannels().then((channelInfo) => {
	const socket = new Pusher(channelInfo.pusherkey);
	const webChatChannel = socket.subscribe(channelInfo['web-chats']);

	db.connect(() => {
		webChatChannel.bind('session-start', (data) => {
			if (data.post_type === 'webchat-markets-live') {
				onSessionStart(data, false);
			}
		});
		webChatChannel.bind('session-end', (data) => {
			if (data.post_type === 'webchat-markets-live') {
				onSessionEnd(data, false);
			}
		});
	});
});


function retryItem () {
	switch (eventsToTryAgain[0].event) {
		case 'session-start':
			return onSessionStart(eventsToTryAgain[0].data, true);
		case 'session-end':
			return onSessionEnd(eventsToTryAgain[0].data, true);
	}
}

function retryFailed () {
	if (eventsToTryAgain.length) {
		retryItem().then(() => {
			eventsToTryAgain.shift();
			setTimeout(retryFailed, 0);
		});
	} else {
		setTimeout(retryFailed, 10000);
	}
}
retryFailed();


setInterval(() => {
	LiveSessionModel
		.find()
		.exec()
		.then((results) => {
			if (results) {
				results.forEach((session) => {
					const mlApi = new MLApi(mlApiBaseUrl, `${session.url}`);

					mlApi.status().then((json) => {
						if (json && json.success === true) {
							if (json.data.status === 'closed') {
								console.log('Worker live sessions safety check - ML init API responded with close status');
								onSessionEnd({
									uuid: session.sessionId
								});
							}
						}
					}).catch((err) => {
						console.log('Worker live sessions safety check - error', err, (err && err.response && err.response.status ? err.response.status : ''));
						if (err && err.response && err.response.status === 404) {
							onSessionEnd({
								uuid: session.sessionId
							});
						}
					});
				});
			}
		})
		.catch(e => {
			console.error(e);
		});
}, 60000);
