const alphavilleUi = require('alphaville-ui');
const AlertOverlay = alphavilleUi['AlertOverlay'];
const FormOverlay = alphavilleUi['FormOverlay'];
const objectToQuery = require('../utils/objectToQuery');
const getUrlParams = require('../utils/getUrlParams');

function onJoin (options) {
	return new Promise(resolve => {
		const mlApiUrl = options.mlApiUrl;
		const token = options.token;

		fetch(`${mlApiUrl}?action=joinWithToken`, {
			credentials: 'include',
			method: 'POST',
			headers: {
				'Content-Type':'application/x-www-form-urlencoded'
			},
			body: `token=${token}`
		})
			.then(res => {
				if (res.ok) {
					return res.json();
				} else {
					throw new Error("Failed to join. Please try again later.");
				}
			})
			.then(json => {
				if (json && json.success === true) {
					if (!json.data.display_name || !json.data.initials) {
						const fields = [];

						if (!json.data.display_name) {
							fields.push({
								type: 'text',
								label: 'Display name',
								name: 'display_name',
								value: json.data.display_name
							});
						}
						if (!json.data.initials) {
							fields.push({
								type: 'text',
								label: 'Initials',
								name: 'initials',
								value: json.data.display_name
							});
						}

						new FormOverlay({
							title: 'Joining ML - missing details',
							submitLabel: 'Save',
							fields: fields
						}).then(formData => {
							fetch(`${mlApiUrl}?action=updateUser`, {
								credentials: 'include',
								method: 'POST',
								body: objectToQuery(formData),
								headers: {
									'Content-Type': 'application/x-www-form-urlencoded'
								},
							}).then(updateRes => {
								if (updateRes && updateRes.ok) {
									return updateRes.json();
								} else {
									new AlertOverlay('Failed to update the user details.');
								}
							}).then(updateJson => {
								if (updateJson && updateJson.success === true) {
									new AlertOverlay('Success', 'User details successfully updated. You now have joined MarketsLive.');
									resolve(true);
								} else {
									new AlertOverlay(updateJson && updateJson.reason ? updateJson.reason : 'The action has failed with unknown reason.');
								}
							}).catch(updateErr => {
								console.log(updateErr);

								new AlertOverlay('The action has failed due to an error.');
							});
						});
					} else {
						new AlertOverlay('Success', 'You now have joined MarketsLive successfully.');
						window.location.hash = '';
						resolve(true);
					}
				} else {
					new AlertOverlay(json && json.reason ? json.reason : 'Failed to join. Please try again later.');
				}
			})
			.catch(e => {
				console.log(e);

				new AlertOverlay(e.message);
			});
	});
}

function joinMLEditorWithToken (mlApiUrl) {
	return new Promise(resolve => {
		const urlParams = getUrlParams();

		if (urlParams['invitation-token'] && window.location.hash.substring(1)) {
			onJoin({
				mlApiUrl,
				token: window.location.hash.substring(1)
			}).then(resolve);
		}
	});
}

module.exports = joinMLEditorWithToken;
