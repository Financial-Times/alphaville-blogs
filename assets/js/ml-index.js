require('./common');

exports.marketsLiveSessionNotification = require('alphaville-ui')['marketslive-session-notification'];
const marketsliveSessionListener = require('alphaville-ui')['marketslive-session-listener'];

exports.liveSessionRedirecter = {
	init: () => {
		let urlParams;
		(window.onpopstate = function () {
			let match;
			const pl = /\+/g;  // Regex for replacing addition symbol with a space
			const search = /([^&=]+)=?([^&]*)/g;
			const decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
			const query = window.location.search.substring(1);

			urlParams = {};
			while (match = search.exec(query)) {
				urlParams[decode(match[1])] = decode(match[2]);
			}
		})();

		if (urlParams.force !== 'home') {
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
};

require('o-autoinit');
