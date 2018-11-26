'use strict';

const Curation = require('../dbModels/Curation');
const StandfirstCharLimitModel = require('../dbModels/StandfirstCharLimit');
const fetch = require('node-fetch');
const qs = require('querystring');
const esServiceUrl = 'http://' + process.env['AV_ES_SERVICE_URL'] + '/v2';
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

			const items = response.items;

			items.forEach((article) => {
				if (article.id === heroArticle) {
					heroWithin30 = true;
				}

				if (article.byline && article.authors.length) {
					article.authors.forEach(author => {
						if (author.isAlphavilleEditor) {
							article.byline = article.byline.replace(
								new RegExp(author.name),
								`<a class="article__byline-tag" href="${author.url}" data-trackable="author">${author.name}</a>`
							);
						}
					});
				}

			});

			if (!heroWithin30) {
				heroArticle = null;
			}

			let isHeroSelected = false;

			items.forEach((article) => {
				article.curation = {};

				delete article.bodyXML;
				delete article.openingXML;

				if (article.av2WebUrl.startsWith('/')) {
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
					}

					if (article.isFurtherReading) {
						article.curation.isFurtherReading = true;
					}


					article.isBlog = true;


					if (article.isPodcast) {
						article.curation.isPodcast = true;
					}

					if (article.seriesArticles) {

						article.curation.isSeriesArticle = true;

						if (article.seriesArticles.series.prefLabel === 'Alphachat') {

							article.isAlphachat = true;
							article.curation.isAlphachat = true;

							delete article.isBlog;

						} else {

							article.title = article.title.replace(`${article.seriesArticles.series.prefLabel}: `, '');
							article.title = article.title.charAt(0).toUpperCase() + article.title.slice(1);

						}
					}


					if (firstPage) {
						if (article.id === heroArticle) {
							article.isHero = true;
							article.curation.isHero = true;
							delete article.isBlog;
						}

						if (curationList[article.id]) {
							const type = curationList[article.id];
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
	response.items.forEach((article) => {
		while (!timeCategories[currentTimeCategory].match(new Date(article.publishedDate))) {
			currentTimeCategory++;
		}

		timeCategories[currentTimeCategory].items.push(article);
	});


	const results = [];
	timeCategories.forEach((timeCategory) => {
		if (timeCategory.items.length) {
			const obj = _.pick(timeCategory, ['label', 'items', 'date']);

			results.push(obj);
		}
	});

	response.items = results;
	return response;
};

exports.truncateStandfirst = (response) => {
	return StandfirstCharLimitModel
		.findOne({
			type: 'grid'
		})
		.exec()
		.then((limit) => {
			const charLimit = limit ? limit.value || 150 : 150;
			response.items.forEach((article) => {
				article.standfirst = ellipsisTrim(article.standfirst, charLimit);
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
	return getAvEsServiceContent(url).then(response => {
		if (!response || !response.items) {
			return {
				items: [],
				total: 0
			};
		}

		return response;
	});
};

exports.getArticles = (endpoint => (options) => getArticles(options, endpoint))('articles');
exports.getArticlesByTopic = (endpoint => (options) => getArticles(options, endpoint))('topic');
exports.getArticlesByAuthor = (endpoint => (options) => getArticles(options, endpoint))('author');
exports.getMarketsliveArticles = (endpoint => (options) => getArticles(options, endpoint))('marketslive');
exports.getHotArticles = (endpoint => (options) => getArticles(options, endpoint))('hotarticles');
exports.getArticlesBySeries = (endpoint => (options) => getArticles(options, endpoint))('series');
exports.getArticlesByType = (endpoint => (options) => getArticles(options, endpoint))('type');
