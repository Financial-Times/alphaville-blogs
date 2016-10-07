'use strict';

const Curation = require('../dbModels/Curation');
const elasticSearch = require('alphaville-es-interface');
const _ = require('lodash');
const cache = require('memory-cache');
const cacheTime = 1000 * 60 * 20; //20 minutes

const moment = require('moment-timezone');
moment.tz.setDefault("Europe/London");

/*
 Bryce Elder
 Kadhim Shubber
 Izabella Kaminska
 David Keohane
 Cardiff Garcia
 Matt Klein
 Joseph Cotterill
 Dan McCrum
 Paul Murphy
 */


const headshots = [{
	name: 'Paul Murphy',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:paul-murphy?source=alphaville&width=124'
}, {
	name: 'Bryce Elder',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:bryce-elder?source=alphaville&width=124'
}, {
	name: 'Cardiff Garcia',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:cardiff-garcia?source=alphaville&width=124'
}, {
	name: 'Dan McCrum',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:dan-mccrum?source=alphaville&width=124'
}, {
	name: 'David Keohane',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:david-keohane?source=alphaville&width=124'
}, {
	name: 'Izabella Kaminska',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:izabella-kaminska?source=alphaville&width=124'
}, {
	name: 'Joseph Cotterill',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:joseph-cotterill?source=alphaville&width=124'
}, {
	name: 'Lisa Pollack',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:lisa-pollack?source=alphaville&width=124'
}, {
	name: 'Matthew C Klein',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:matthew-c-klein?source=alphaville&width=124'
}];

function ellipsisTrim(str, length) {
	const options = {
		length,
		separator: ' '
	};
	return _.truncate(str, options);
}

function getCurationList () {
	return Curation.find({}, '-_id').exec().then((curationList) => {
		const mapping = {};
		let hero;

		curationList.forEach((item) => {
			if (item.type === 'hero') {
				hero = item.articleId;
			} else {
				mapping[item.articleId] = item.type;
			}
		});

		return {
			mapping: mapping,
			hero: hero
		};
	});
}

exports.categorization = function (response, firstPage) {
	return getCurationList()
		.then((curation) => {
			const curationList = curation.mapping;
			const heroArticle = curation.hero;

			let isHeroSelected = false;

			response.hits.hits.forEach((article) => {
				article.curation = {};

				function filterMetadataBy(options) {
					return _.filter(article._source.metadata, options);
				}

				delete article._source.bodyXML;
				delete article._source.openingXML;

				if (article._source.av2WebUrl.startsWith('/')) {
					article.withInlineRead = true;
				}

				if (article._source.title.length > 120) {
					article._source.title = ellipsisTrim(article._source.title, 120);
				}

				if (article.isMarketsLive === true) {
					article._source.primaryTheme = 'Markets Live';
					article._source.title = article._source.title.replace(/Markets Live: /, '');

					if (article.isLive === true) {
						delete article.withInlineRead;
					}

					article.curation.isMarketsLive = true;
				} else if (filterMetadataBy({ prefLabel: 'First FT' }).length > 0) {
					article.isFirstFT = true;
					article._source.primaryTheme = 'First FT';

					article.curation.isFirstFT = true;
				} else {
					if (article._source.title.indexOf('FT Opening Quote:') !== -1) {
						article._source.primaryTheme = "FT Opening Quote";
						article._source.title = article._source.title.replace('FT Opening Quote: ', '');
						article.isOpeningQuote = true;
					} else if (article._source.title.indexOf('Further reading') !== -1) {
						article._source.primaryTheme = "Further reading";
						article.isFurtherReading = true;
					} else if (article._source.title.indexOf('Guest post:') !== -1) {
						article._source.primaryTheme = "Guest post";
						article._source.title = article._source.title.replace('Guest post: ', '');
						article.isGuestPost = true;
					} else {
						const sections = filterMetadataBy({ primary: 'section', taxonomy: 'sections' });
						if (sections && sections.length) {
							article._source.primaryTheme = sections[0].prefLabel;
						} else {
							article._source.primaryTheme = "";
						}
					}

					article.isBlog = true;

					if (article._source.mainImage && article._source.mainImage.url) {
						article.withImage = true;
					}

					if (firstPage) {
						if (article._id === heroArticle) {
							article.isHero = true;
							article.curation.isHero = true;
							delete article.isBlog;
						}

						if (!heroArticle && !isHeroSelected && article._source.title.indexOf('FT Opening Quote') === -1 && article.isBlog) {
							if (new Date().getTime() - new Date(article._source.publishedDate).getTime() < 48 * 60 * 60 * 1000) {
								article.isHero = true;
								delete article.isBlog;
								isHeroSelected = true;
							}
						}

						if (curationList[article._id]) {
							const type = curationList[article._id];
							article.curation['is' + type.charAt(0).toUpperCase() + type.slice(1)] = true;

							if (article.isBlog) {
								delete article.isBlog;
								article['is' + type.charAt(0).toUpperCase() + type.slice(1)] = true;
							}
						}
					}
				}
			});

			return response;
		})
		.catch((err) => {
			console.log("Error fetching curation list", err);
			return response;
		});
};

exports.groupByTime = function (response) {
	const timeCategories = [
		{
			label: 'Today',
			match: date => {
				const today = moment(new Date());
				date = moment(date);

				return (date.year() === today.year()
						&& date.dayOfYear() === today.dayOfYear());
			},
			date: new Date().toISOString(),
			items: []
		},
		{
			label: 'This week',
			match: date => {
				date = moment(date);
				const today = moment(new Date());
				const startOfWeek = moment().startOf('week').add(1, 'day');

				return (startOfWeek.isBefore(date) && today.isAfter(date));
			},
			items: []
		},
		{
			label: 'Last week',
			match: date => {
				date = moment(date);
				const startOfLastWeek = moment().startOf('week').subtract(6, 'day');
				const endOfLastWeek = moment().endOf('week').subtract(6, 'day');

				return (startOfLastWeek.isBefore(date) && endOfLastWeek.isAfter(date));
			},
			items: []
		},
		{
			label: 'This month',
			match: date => {
				date = moment(date);
				const startOfThisMonth = moment().startOf('month');
				const endOfThisMonth = moment().endOf('month');

				return (startOfThisMonth.isBefore(date) && endOfThisMonth.isAfter(date));
			},
			items: []
		},
		{
			label: 'Last month',
			match: date => {
				date = moment(date);
				const startOfLastMonth = moment().startOf('month').subtract(1, 'month');
				const endOfLastMonth = moment().endOf('month').subtract(1, 'month');

				return (startOfLastMonth.isBefore(date) && endOfLastMonth.isAfter(date));
			},
			items: []
		},
		{
			label: 'Older',
			match: () => {
				return true;
			},
			items: []
		}
	];

	let currentTimeCategory = 0;
	response.hits.hits.forEach((article) => {
		while (!timeCategories[currentTimeCategory].match(new Date(article._source.publishedDate))) {
			currentTimeCategory++;
		}

		timeCategories[currentTimeCategory].items.push(article);
	});


	const results = [];
	let categoryIndex = 0;
	timeCategories.forEach((timeCategory) => {
		if (timeCategory.items.length) {
			categoryIndex++;
			const obj = _.pick(timeCategory, ['label', 'items', 'date']);

			if (categoryIndex === 1) {
				obj.mpu = 1;
			} else if (categoryIndex === 3) {
				obj.mpu = 2;
			}
			results.push(obj);
		}
	});

	return results;
};

exports.getArticles = function (limit, offset) {
	return elasticSearch.searchArticles({
		method: 'POST',
		body: JSON.stringify({
			filter: {
				or: {
					filters: [{
						term: {
							"metadata.primary": {
								value: "brand"
							},
							"metadata.idV1": {
								value: "ZDkyYTVhMzYtYjAyOS00OWI1LWI5ZTgtM2QyYTIzYjk4Y2Jj-QnJhbmRz" // FT Alphaville
							}
						}
					}, {
						term: {
							"metadata.primary": {
								value: "brand"
							},
							"metadata.idV1": {
								value: "N2NkMjJiYzQtOGI3MC00NTM4LTgzYmYtMTQ3YmJkZGZkODJj-QnJhbmRz" // First FT
							}
						}
					}]
				}
			},
			sort: {
				publishedDate: {
					order: 'desc'
				}
			},
			from: offset || 0,
			size: limit || 30
		})

	});
};

exports.getMarketsliveArticles = function (limit, offset) {
	return elasticSearch.searchArticles({
		method: 'POST',
		body: JSON.stringify({
			filter: {
				and: {
					filters: [{
							term: {
								"metadata.primary": {
									value: "section"
								},
								"metadata.idV1": {
									value: "NzE=-U2VjdGlvbnM=" // Markets
								}
							}
						},
						{
							term: {
								"metadata.primary": {
									value: "brand"
								},
								"metadata.idV1": {
									value: "ZDkyYTVhMzYtYjAyOS00OWI1LWI5ZTgtM2QyYTIzYjk4Y2Jj-QnJhbmRz" // FT Alphaville
								}
							}
						},
						{
							regexp: {
								webUrl: {
									value: "(.*)marketslive(.*)"
								}
							}
						}]
				}
			},
			sort: {
				publishedDate: {
					order: 'desc'
				}
			},
			from: offset || 0,
			size: limit || 30
		})

	});
};

exports.getLatestPostsByAuthor = function (author, count) {
	return elasticSearch.searchArticles({
		'method': 'POST',
		'body': JSON.stringify({
			query: {
				match: {
					byline: author
				}
			},
			'sort': {
				publishedDate: {
					order: 'desc'
				}
			},
			'size': count || 5
		})
	});
};
