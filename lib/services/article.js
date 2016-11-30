'use strict';

const Curation = require('../dbModels/Curation');
const StandfirstCharLimitModel = require('../dbModels/StandfirstCharLimit');
const fetch = require('node-fetch');
const qs = require('querystring');
const esServiceUrl = 'https://' + process.env['AV_ES_SERVICE_URL'] + '/v1';
const _ = require('lodash');
const util = require('../utils/misc');

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
	return fetch(url, {headers: {'X-API-KEY': process.env['AV_ES_SERVICE_KEY']}})
		.then(res => {
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

				if (article.isMarketsLive === true) {

					delete article.withInlineRead;
					article.curation.isMarketsLive = true;

				} else if (article.isFirstFT) {

					delete article.withInlineRead;
					article.curation.isFirstFT = true;

				} else {
					if (article.isOpeningQuote) {

						article.curation.isOpeningQuote = true;

					} else if (article.isGuestPost) {
						article.curation.isGuestPost = true;

					// } else {
					// 	const sections = filterMetadataBy({ primary: 'section', taxonomy: 'sections' });
					// 	if (sections && sections.length) {
					// 		article._source.primaryTheme = sections[0].prefLabel;
					// 	} else {
					// 		article._source.primaryTheme = "";
					// 	}
					}

					if (article._source.title.indexOf('Further reading') !== -1) {
						article.isFurtherReading = true;
						article.curation.isFurtherReading = true;
					}


					article.isBlog = true;


					if (article.isPodcast) {
						article.curation.isPodcast = true;
					}

					if (article._source.seriesArticles) {

						article.curation.isSeriesArticle = true;

						if (article._source.seriesArticles.series.prefLabel === 'Alphachat') {

							article.isAlphachat = true;
							article.curation.isAlphachat = true;

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

						if (!heroArticle
								&& !isHeroSelected
								&& !article.isOpeningQuote
								&& !article.isGuestPost
								&& !article.isFurtherReading
								&& !article.curation.isFirstFT
								&& !article.curation.isSeriesArticle
								&& !article.curation.isAlphachat
								&& !article.curation.isPodcast
								&& article.isBlog) {
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

exports.truncateStandfirst = (response) => {
	return StandfirstCharLimitModel
		.findOne({
			type: 'grid'
		})
		.exec()
		.then((limit) => {
			const charLimit = limit ? limit.value || 150 : 150;
			response.hits.hits.forEach((article) => {
				article._source.standfirst = ellipsisTrim(article._source.standfirst, charLimit);
			});
			return response;
		})
		.catch((err) => {
			console.log("Error while fetching standfirst limit.", err);
			return response;
		});
};



exports.getArticle = function(vanityOrUuid) {
	const url = `${esServiceUrl}/${util.sanitizePath(vanityOrUuid)}`;
	return getAvEsServiceContent(url);
};


const getArticles = (options, endpoint) => {
	options = options || {};
	let url = `${esServiceUrl}/${endpoint}?${qs.stringify(_.omit(options, ['noCache']))}`;
	if (options && options.noCache === true) {
		url += '&_=' + new Date().getTime();
	}
	return getAvEsServiceContent(url);
};

exports.getArticles = (endpoint => (options) => getArticles(options, endpoint))('articles');
exports.getArticlesByTopic = (endpoint => (options) => getArticles(options, endpoint))('topic');
exports.getArticlesByAuthor = (endpoint => (options) => getArticles(options, endpoint))('author');
exports.getMarketsliveArticles = (endpoint => (options) => getArticles(options, endpoint))('marketslive');
exports.getHotArticles = (endpoint => (options) => getArticles(options, endpoint))('hotarticles');
exports.getMostReadArticles = (endpoint => (options) => getArticles(options, endpoint))('most-read');
exports.getMostCommentedArticles = (endpoint => (options) => getArticles(options, endpoint))('most-commented');
exports.getArticlesBySeries = (endpoint => (options) => getArticles(options, endpoint))('series');
