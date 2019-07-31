const oPermutive = require('o-permutive');
const oAds = require('o-ads');

const adsApiEndpoints = {
	user: () => 'https://ads-api.ft.com/v2/user',
	content: (contentId) => `https://ads-api.ft.com/v2/content/${contentId}`,
}

const getUser = () => {
	return oAds.api.getUserData(adsApiEndpoints.user(), 250)
		.catch((error) => {
			console.warn('oPermutive: Could not identify user');
			throw error;
		})
};

const getContent = (contentId) => {
	return oAds.api.getPageData(adsApiEndpoints.content(contentId), 250)
		.catch((error) => {
			console.warn('oPermutive: Could not set page metadata', error);
		});
}

const identifyUser = (user) => {
	if (user) {
		oPermutive.identifyUser({
			guid: user.uuid,
			spoorID: user.spoorId,
		});
		return user;
	}
};

const setPageMetaData = (content, user) => {
	const pageMetaData = { type: 'article' };

	if (content) {
		pageMetaData.article = {
			id: content.uuid,
			// title,
			// type,
			organisations: content.organisation,
			people: content.person,
			categories: content.categories,
			authors: content.person,
			topics: content.topic,
			admants: content.admants,
		};
	}

	if (user) {
		pageMetaData.user = {
			industry: user.industry.code,
			responsibility: user.responsibility.code,
			position: user.position.code,
		};
	}

	oPermutive.setPageMetaData(pageMetaData);
};

const setUserAndPage = (contentId) => {
	getUser()
		.then(identifyUser)
		.then((user) => {
			getContent(contentId)
				.then((content) => setPageMetaData(content, user));
		});
}

module.exports = {
	setUserAndPage,
};
