require('./common');

exports.marketsLiveSessionNotification = require('alphaville-ui')['marketslive-session-notification'];
const marketsliveSessionListener = require('alphaville-ui')['marketslive-session-listener'];
const alphavilleUi = require('alphaville-ui');
const AlertOverlay = alphavilleUi['AlertOverlay'];
const FormOverlay = alphavilleUi['FormOverlay'];

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


const DAYS = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
];

const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

function objectToQuery (obj) {
	const res = [];

	Object.keys(obj).forEach(key => {
		res.push(`${key}=${obj[key]}`);
	});

	return res.join('&');
}

exports.mlEditor = {
	init: (mlApiUrl) => {
		fetch(`${mlApiUrl}?action=access`, {
			credentials: 'include'
		})
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error("ML access call failed");
				}
			})
			.then(json => {
				if (json.data.isparticipant === true || json.data.iseditor === true) {
					document.documentElement.classList.add('ml-editor');

					document.querySelector('.ml-create-new-session-btn').addEventListener('click', () => {
						const today = new Date();

						new FormOverlay({
							title: 'New session',
							submitLabel: 'Create',
							fields: [
								{
									type: 'text',
									label: 'Title',
									name: 'title',
									placeholder: `${DAYS[today.getDay()]}, ${today.getDate()}${[11, 12].includes(today.getDate() % 100) ? 'th' : today.getDate() % 10 === 1 ? 'st' : today.getDate() % 10 === 2 ? 'nd' : 'th'} ${MONTHS[today.getMonth()]}, ${today.getFullYear()}`
								},
								{
									type: 'text',
									label: 'Excerpt',
									name: 'excerpt',
									placeholder: 'Live markets commentary from FT.com'
								}
							]
						}).then(result => {
							if (result) {
								return fetch(`${mlApiUrl}?action=createSession`, {
									credentials: 'include',
									method: 'POST',
									body: objectToQuery(result),
									headers: {
										'Content-Type': 'application/x-www-form-urlencoded'
									},
								}).then(res => {
									if (res && res.ok) {
										return res.json();
									} else {
										new AlertOverlay('Cannot connect to the MarketsLive service.');
									}
								}).then(json => {
									if (json.success === true && json.data && json.data.path) {
										window.location = '/marketslive/' + json.data.path;
									} else {
										new AlertOverlay(json.reason ? json.reason : 'The action has failed with unknown reason.');
									}
								}).catch(e => {
									console.log(e);

									new AlertOverlay('The action has failed due to an error.');
								});
							} else {
								return false;
							}
						}).catch(e => {
							console.log(e);

							new AlertOverlay('The action has failed due to an error.');
						});;
					});
				}
			})
			.catch(console.log);
	}
};

require('o-autoinit');
