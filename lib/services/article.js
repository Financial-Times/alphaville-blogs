'use strict';

const Curation = require('../dbModels/Curation');
const fetch = require('node-fetch');
const qs = require('querystring');
const esServiceUrl = process.env['AV_ES_SERVICE_URL'];
const _ = require('lodash');

const moment = require('moment-timezone');
moment.tz.setDefault("Europe/London");

function ellipsisTrim(str, length) {
	const options = {
		length,
		separator: ' '
	};
	return _.truncate(str, options);
}

const getAvEsServiceContent = (url) => {
	return fetch(url).then(res => {
		if (res.status === 200) {
			return res.json();
		}
	});
};

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
			let heroArticle = curation.hero;
			let heroWithin30 = false;

			response.hits.hits.forEach((article) => {
				if (article._id === heroArticle) {
					heroWithin30 = true;
				}
			});

			if (!heroWithin30) {
				heroArticle = null;
			}

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
						article._source.title = article._source.title.charAt(0).toUpperCase() + article._source.title.slice(1);

						article.isOpeningQuote = true;
						article.curation.isOpeningQuote = true;
					} else if (article._source.title.indexOf('Guest post:') !== -1) {
						article._source.primaryTheme = "Guest post";
						article._source.title = article._source.title.replace('Guest post: ', '');
						article._source.title = article._source.title.charAt(0).toUpperCase() + article._source.title.slice(1);

						article.isGuestPost = true;
						article.curation.isGuestPost = true;
					} else {
						const sections = filterMetadataBy({ primary: 'section', taxonomy: 'sections' });
						if (sections && sections.length) {
							article._source.primaryTheme = sections[0].prefLabel;
						} else {
							article._source.primaryTheme = "";
						}
					}

					if (article._source.title.indexOf('Further reading') !== -1) {
						article.isFurtherReading = true;
						article.curation.isFurtherReading = true;
					}


					article.isBlog = true;


					if (article._source.title.toLowerCase().indexOf('podcast:') !== -1) {
						article.isPodcast = true;
						article._source.title = article._source.title.replace('Podcast: ', '');
						article._source.title = article._source.title.charAt(0).toUpperCase() + article._source.title.slice(1);
						console.log(article._source.title);
					}

					if (article._source.seriesArticles) {

						article._source.primaryTheme = article._source.seriesArticles.series.prefLabel;
						article.isSeriesArticle = true;
						article.curation.isSeriesArticle = true;

						if (article._source.seriesArticles.series.prefLabel === 'Alphachat') {

							article.isAlphachat = true;
							article.curation.isAlphachat = true;

							article._source.title = article._source.title.replace('Alphachat: ', '');
							article._source.title = article._source.title.charAt(0).toUpperCase() + article._source.title.slice(1);

							delete article.isBlog;

						} else {

							article._source.title = article._source.title.replace(`${article._source.seriesArticles.series.prefLabel}: `, '');
							article._source.title = article._source.title.charAt(0).toUpperCase() + article._source.title.slice(1);

						}
					}


					if (article._source.mainImage && article._source.mainImage.url) {
						article.withImage = true;
					}

					if (firstPage) {
						if (article._id === heroArticle) {
							article.isHero = true;
							article.curation.isHero = true;
							delete article.isBlog;
						}

						if (curationList[article._id]) {
							const type = curationList[article._id];
							article.curation['is' + type.charAt(0).toUpperCase() + type.slice(1)] = true;

							if (article.isBlog) {
								delete article.isBlog;
								article['is' + type.charAt(0).toUpperCase() + type.slice(1)] = true;
							}
						}

						if (!heroArticle && !isHeroSelected && !article.isOpeningQuote && !article.isGuestPost && !article.isFurtherReading && !article.curation.isFirstFT && article.isBlog) {
							article.isHero = true;
							delete article.isBlog;
							isHeroSelected = true;
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

			results.push(obj);
		}
	});

	return results;
};

exports.getArticle = function(vanityOrUuid) {
	const url = `${esServiceUrl}/${vanityOrUuid}`;
	return getAvEsServiceContent(url);
};

exports.getArticles = function (q, limit, offset) {
	const url = `${esServiceUrl}/articles?${qs.stringify({q, limit, offset})}`;
	return getAvEsServiceContent(url);
};

exports.getMarketsliveArticles = function (limit, offset) {
	const url = `${esServiceUrl}/marketslive?${qs.stringify({limit, offset})}`;
	return getAvEsServiceContent(url);
};

exports.getHotArticles = function (limit) {
	const url = `${esServiceUrl}/hotarticles?${qs.stringify({limit})}`;
	return getAvEsServiceContent(url);
};
