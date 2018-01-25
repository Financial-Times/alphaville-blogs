const alphavilleUi = require('alphaville-ui');
const AlertOverlay = alphavilleUi['AlertOverlay'];
const ConfirmOverlay = alphavilleUi['ConfirmOverlay'];
const FormOverlay = alphavilleUi['FormOverlay'];
const objectToQuery = require('../utils/objectToQuery');
const Delegate = require('dom-delegate');

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

function onDeleteSession (options) {
	const mlApiUrl = options.mlApiUrl;
	const uuid = options.uuid;
	const sessionPath = options.sessionPath;

	new ConfirmOverlay('Delete session', 'Are you sure you want to delete this session?')
		.then(answer => {
			if (answer === true) {
				fetch(`${mlApiUrl}/${sessionPath}/?action=deleteSession`, {
					credentials: 'include',
					method: 'POST'
				})
					.then(res => {
						if (res.ok) {
							return res.json();
						} else {
							new AlertOverlay('Cannot connect to the MarketsLive service.');
						}
					})
					.then(json => {
						if (json && json.success === true) {
							const articleComponent = document.querySelector(`.alphaville-card[data-article-id="${uuid}"]`);
							if (articleComponent) {
								articleComponent.parentNode.parentNode.removeChild(articleComponent.parentNode);
							}

							new AlertOverlay('Session deleted successfully. Due to caching it might disappear from the page with some delay.');
						} else {
							new AlertOverlay(json.reason ? json.reason : 'The action has failed with unknown reason.');
						}
					})
					.catch(e => {
						console.log(e);

						new AlertOverlay(e && e.message ? e.message : 'The action has failed due to an error.');
					});
			} else {
				return false;
			}
		});
}

function onEditSession (options) {
	const mlApiUrl = options.mlApiUrl;
	const uuid = options.uuid;
	const sessionPath = options.sessionPath;

	const articleComponent = document.querySelector(`.alphaville-card[data-article-id="${uuid}"]`);
	if (articleComponent) {
		new FormOverlay({
			title: 'Edit session',
			submitLabel: 'Save',
			fields: [
				{
					type: 'text',
					label: 'Title',
					name: 'title',
					value: articleComponent.querySelector('.alphaville-card__heading a').innerHTML
				},
				{
					type: 'text',
					label: 'Excerpt',
					name: 'excerpt',
					value: articleComponent.querySelector('.alphaville-card__standfirst').innerHTML
				}
			]
		}).then(result => {
			if (result) {
				fetch(`${mlApiUrl}/${sessionPath}/?action=editSession`, {
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
						articleComponent.querySelector('.alphaville-card__heading a').innerHTML = result.title;
						articleComponent.querySelector('.alphaville-card__standfirst').innerHTML = result.excerpt;

						new AlertOverlay('Session edited successfully. Due to caching it might take some time to update it.');
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
	} else {
		new AlertOverlay('Something went wrong.');
	}
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
					document.documentElement.classList.add('ml-editor');

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

					const mlEditorDelegate = new Delegate(document.body);
					mlEditorDelegate.on('click', '.ml-delete-session', (evt) => {
						const deleteButton = evt.target;

						onDeleteSession({
							mlApiUrl,
							uuid: deleteButton.getAttribute('data-session-uuid'),
							sessionPath: deleteButton.getAttribute('data-session-path'),
							eventTarget: evt.target
						});
					});

					mlEditorDelegate.on('click', '.ml-edit-session', (evt) => {
						const deleteButton = evt.target;

						onEditSession({
							mlApiUrl,
							uuid: deleteButton.getAttribute('data-session-uuid'),
							sessionPath: deleteButton.getAttribute('data-session-path'),
							eventTarget: evt.target
						});
					});
				}
			})
			.catch(console.log);
}

module.exports = mlEditor;
