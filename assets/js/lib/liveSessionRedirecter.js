const marketsliveSessionListener = require('alphaville-ui')['marketslive-session-listener'];
const getUrlParams = require('../utils/getUrlParams');

function liveSessionRedirecter () {
	const urlParams = getUrlParams();

	if (urlParams.force !== 'home' && !urlParams['invitation-token']) {
		marketsliveSessionListener.activeSession().then(function (session) {
			if (session) {
				window.location.href = session.url;
			}
		}).catch(function (err) {
			console.log(err);
		});

		marketsliveSessionListener.listen().then(function (socket) {
			if (socket) {
				socket.bind('session-start', function (sessionData) {
					const url = sessionData.url.replace(/http(s?):\/\/[^\/]+/, '');
					window.location.href = url;
				});
			}
		}).catch(function (err) {
			console.log(err);
		});
	}
}
module.exports = liveSessionRedirecter;
