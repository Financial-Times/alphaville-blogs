const Delegate = require('dom-delegate');
const alphavilleUi = require('alphaville-ui');
const AlertOverlay = alphavilleUi['AlertOverlay'];
const ConfirmOverlay = alphavilleUi['ConfirmOverlay'];
const FormOverlay = alphavilleUi['FormOverlay'];
const objectToQuery = require('../utils/objectToQuery');



function addEditButtons (el) {
	const participantOptionsFragment = document.createDocumentFragment();
	const participantOptionsEl = document.createElement('div');
	participantOptionsEl.className = 'msg-action-container';

	const editButton = document.createElement('button');
	editButton.innerHTML = 'Edit';
	editButton.className = 'o-buttons o-buttons--standout msg-action-button msg-edit';
	participantOptionsEl.appendChild(editButton);


	const deleteButton = document.createElement('button');
	deleteButton.innerHTML = 'Delete';
	deleteButton.className = 'o-buttons o-buttons--standout msg-action-button msg-delete';
	participantOptionsEl.appendChild(deleteButton);

	participantOptionsFragment.appendChild(participantOptionsEl);

	el.appendChild(participantOptionsFragment);
}

function onEditMessage (mlApiUrl, messageEl) {
	const messageId = messageEl.getAttribute('data-mid');
	const originalMessage = messageEl.getAttribute('data-rawmessage');
	const isBlockquote = messageEl.getAttribute('data-blockquote') === 'true';

	new FormOverlay({
		title: 'Edit message',
		submitLabel: 'Submit',
		fields: [
			{
				type: 'textarea',
				label: 'Message',
				name: 'message',
				value: originalMessage
			},
			{
				type: 'checkbox',
				label: 'Quote',
				name: 'quote',
				checked: isBlockquote
			}
		]
	}).then(result => {
		if (result) {
			return fetch(`${mlApiUrl}?action=editmsg&v=2`, {
				credentials: 'include',
				method: 'POST',
				body: objectToQuery({
					messageid: messageId,
					newtext: result.message,
					keytext: '',
					isblockquote: result.quote
				}),
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
				if (json.success === true && json.data) {
					const wrapper = document.createElement('div');
					wrapper.innerHTML= json.data;
					addEditButtons(wrapper.firstElementChild);

					messageEl = messageEl.parentNode.replaceChild(wrapper.firstElementChild, messageEl);

					new AlertOverlay('Message successfully edited. It might take up to 1 hour the edit to be visible on the page for all users.');
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


function onDeleteMessage (mlApiUrl, messageEl) {
	const messageId = messageEl.getAttribute('data-mid');

	new ConfirmOverlay('Delete message', 'Are you sure you want to delete this message?')
		.then(answer => {
			if (answer === true) {
				return fetch(`${mlApiUrl}?action=deletemsg&v=2`, {
					credentials: 'include',
					method: 'POST',
					body: objectToQuery({
						messageid: messageId
					}),
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
					if (json.success === true) {
						messageEl.parentNode.removeChild(messageEl);

						new AlertOverlay('Message successfully deleted. It might take up to 1 hour the edit to be visible on the page for all users.');
					} else {
						new AlertOverlay(json.reason ? json.reason : 'The action has failed with unknown reason.');
					}
				}).catch(e => {
					console.log(e);

					new AlertOverlay('The action has failed due to an error.');
				});
			}
		})
		.catch(e => {
			console.log(e);

			new AlertOverlay('The action has failed due to an error.');
		});
}


function mlTranscriptEditor (mlApiUrl) {
	let matchDate = window.location.pathname.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}(-[0-9]+)?/);
	if (matchDate && matchDate.length) {
		matchDate = matchDate[0];
	} else {
		return;
	}

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

					const webchatContent = document.querySelector('.webchat-closed-content');
					const messages = webchatContent.querySelectorAll('.msg');
					for (let i = 0; i < messages.length; i++) {
						const msg = messages[i];

						addEditButtons(msg);
					}


					const mlTranscriptEditor = new Delegate(webchatContent);
					mlTranscriptEditor.on('click', '.msg-edit', (evt) => {
						const messageEl = evt.target.parentNode.parentNode;
						onEditMessage(`${mlApiUrl}/${matchDate}`, messageEl);
					});

					mlTranscriptEditor.on('click', '.msg-delete', (evt) => {
						const messageEl = evt.target.parentNode.parentNode;
						onDeleteMessage(`${mlApiUrl}/${matchDate}`, messageEl);
					});
				}
			});
}
module.exports = mlTranscriptEditor;
