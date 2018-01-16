const alphavilleUi = require('alphaville-ui');
const AlertOverlay = alphavilleUi['AlertOverlay'];
const FormOverlay = alphavilleUi['FormOverlay'];
const objectToQuery = require('../utils/objectToQuery');

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


function onCreateSession (options) {
	const mlApiUrl = options.mlApiUrl;

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
	});
}

function onInviteRequest (options) {
	const mlApiUrl = options.mlApiUrl;
	const appUrl = options.appUrl;
	const invitationType = options.type;

	fetch(`${mlApiUrl}?action=getInviteToken&type=${invitationType}`, {
		credentials: 'include'
	})
		.then(res => {
			if (res.ok) {
				return res.json();
			} else {
				throw new Error("Invitation code failed to obtain");
			}
		})
		.then(json => {
			if (json && json.data && json.data.token) {
				new FormOverlay({
					title: 'Invitation',
					fields: [
						{
							type: 'text',
							label: 'Copy this URL and send to the invited person',
							name: 'invitation-url',
							value: `${appUrl}/marketslive?invitation-token=true#${json.data.token}`
						}
					]
				});
			} else {
				throw new Error("Invalid response");
			}
		})
		.catch(e => {
			console.log(e);

			new AlertOverlay('The action has failed due to an error.');
		});
}

function mlEditor (mlApiUrl, appUrl) {
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
				if (json && json.data && json.data.iseditor === true) {
					if (json.data.iseditor === true) {
						document.documentElement.classList.add('ml-editor');
					}

					document.querySelector('.ml-create-new-session-btn').addEventListener('click', () => {
						onCreateSession({
							mlApiUrl,
							appUrl
						});
					});
					document.querySelector('.ml-invite-editor-btn').addEventListener('click', () => {
						onInviteRequest({
							mlApiUrl,
							appUrl,
							type: 'editor'
						});
					});

					document.querySelector('.ml-invite-contributor-btn').addEventListener('click', () => {
						onInviteRequest({
							mlApiUrl,
							appUrl,
							type: 'participant'
						});
					});
				}
			})
			.catch(console.log);
}

module.exports = mlEditor;
