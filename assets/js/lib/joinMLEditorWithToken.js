const alphavilleUi = require('alphaville-ui');
const AlertOverlay = alphavilleUi['AlertOverlay'];
const FormOverlay = alphavilleUi['FormOverlay'];
const objectToQuery = require('../utils/objectToQuery');
const getUrlParams = require('../utils/getUrlParams');

function onJoin (options) {
	return new Promise(() => {
		const mlApiUrl = options.mlApiUrl;

		const body = {
			token: options.token
		};
		if (options.first_name) {
			body.first_name = options.first_name;
		}
		if (options.last_name) {
			body.last_name = options.last_name;
		}

		fetch(`${mlApiUrl}?action=joinWithToken`, {
			credentials: 'include',
			method: 'POST',
			headers: {
				'Content-Type':'application/x-www-form-urlencoded'
			},
			body: objectToQuery(body)
		})
			.then(res => res.json())
			.then(json => {
				if (json) {
					if (json.success === false) {
						if (!json.reason && json.data && (!json.data.first_name || !json.data.last_name)) {
							const fields = [{
								type: 'static-text',
								label: 'You have some missing fields. Please complete them to finish your join request.'
							}];

							const firstName = json.data.first_name || options.first_name || '';
							const lastName = json.data.last_name || options.last_name || '';

							if (!json.data.first_name) {
								fields.push({
									type: 'text',
									label: 'First name',
									name: 'first_name',
									value: firstName,
									attributes: {
										required: 'required'
									}
								});
							}

							if (!json.data.last_name) {
								fields.push({
									type: 'text',
									label: 'Last name',
									name: 'last_name',
									value: lastName,
									attributes: {
										required: 'required'
									}
								});
							}

							new FormOverlay({
								title: 'Joining ML - missing details',
								submitLabel: 'Save',
								fields: fields
							}).then(formData => {
								if (formData === false) {
									window.location.hash = '';
								} else if (formData) {
									onJoin(Object.assign({}, options, formData));
								}
							});
						} else {
							new AlertOverlay(json && json.reason ? json.reason : 'Failed to join. Please try again later.');
						}
					} else {
						new AlertOverlay('Success', 'You have joined MarketsLive successfully.');
						window.location.hash = '';
					}
				} else {
					new AlertOverlay('Something went wrong. Please try again later or contact an administrator.');
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
