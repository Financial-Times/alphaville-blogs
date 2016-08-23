'use strict';

const elasticSearch = require('alphaville-es-interface');
const articleService = require('../services/article');
const liveSessionService = require('../services/liveSessions');
const WpApi = require('alphaville-marketslive-wordpress-api');
const pagination = require('../utils/pagination');

const itemsPerPage = 20;

exports.index = function (req, res, next) {
	res.set('Cache-Control', 'no-cache');

	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	articleService.getMarketsliveArticles(itemsPerPage, (page - 1) * itemsPerPage)
		.then(response => {
			const transcripts = articleService.groupByTime(response);

			const totalPages = Math.ceil(response.hits.total / itemsPerPage);

			const render = function () {
				res.render('ml-index', {
					title: 'Marketslive index | FT Alphaville',
					transcripts: transcripts,
					withMostRecentPost: true,
					pagination: pagination.getRenderConfig(page, totalPages, req)
				});
			};

			if (req.query.force === 'home') {
				render();
				return;
			}

			liveSessionService.latest().then((session) => {
				if (session) {
					res.redirect(session.url);
				} else {
					render();
				}
			}).catch(() => {
				render();
			});
	}).catch(next);
};



function renderLowerEnvItem (req, res, next) {
	const wpPath = req.params[0];
	const wpApi = new WpApi(wpPath);

	let lfId = wpPath.replace('marketslive');

	while(lfId[0] === '/') {
		lfId = lfId.substr(1, lfId.length);
	}

	while(lfId[lfId.length - 1] === '/') {
		lfId = lfId.substr(0, lfId.length - 1);
	}

	Promise.all([wpApi.init(), wpApi.catchup()]).then((results) => {
		const status = results[0];
		const catchup = results[1];

		if (status.success === true) {
			if (status.data.status === 'inprogress') {
				const renderData = {
					title: 'MarketsLive',
					articleId: `marketslive-test-${lfId}`,
					apiUrl: process.env.WP_URL + `/marketslive/${wpPath}`
				};

				if (status.data.allow_comment !== false) {
					res.render('ml-live', renderData);
				} else {
					res.render('ml-live_without_comments', renderData);
				}
				return;
			} else if (catchup.success === true) {
				next();
				return;
			} else {
				throw new Error(catchup.reason || "No data available.");
			}
		} else {
			throw new Error(status.reason);
		}
	}).catch(next);
}

exports.byUuid = function (req, res, next) {
	return elasticSearch.getArticle(req.params[0]).then((article) => {
		if (article.found !== true) {
			next();
			return;
		}

		if (article.isMarketsLive === true) {
			res.redirect(301, article._source.av2WebUrl);
		} else {
			next();
		}
	});
};

exports.byVanity = function (req, res, next) {
	let urlPath = req.params[0];
	if (urlPath[0] === '/') {
		urlPath = urlPath.substr(1, urlPath.length);
	}
	if (urlPath[urlPath.length - 1] === '/') {
		urlPath = urlPath.substr(0, urlPath.length - 1);
	}

	const urlToSearch = `http://ftalphaville.ft.com/marketslive/${urlPath}/`;

	return elasticSearch.searchArticles({
		method: 'POST',
		body: JSON.stringify({
			query: {
				match: {
					webUrl: urlToSearch
				}
			},
			size: 1
		})
	}).then((article) => {
		if (!article.hits.hits.length) {
			renderLowerEnvItem(req, res, next);
			return;
		}

		article = article.hits.hits[0];

		function getMetadata(taxonomy) {
			return article._source.metadata.filter(function (item) {
				return (item.taxonomy === taxonomy);
			});
		}

		if (article.isMarketsLive === true) {
			if (article.isLive === true) {
				res.set('Cache-Control', 'no-cache');

				const wpApi = new WpApi(req.params[0]);

				const renderData = {
					title: article._source.title,
					articleId: article._id,
					apiUrl: `${process.env.WP_URL}/marketslive/${urlPath}`
				};

				wpApi.init().then((status) => {
					if (status.data.allow_comment !== false) {
						res.render('ml-live', renderData);
					} else {
						res.render('ml-live_without_comments', renderData);
					}
				}).catch(next);
			} else {
				if (process.env.ENVIRONMENT === 'prod') {
					res.set('Cache-Control', 'public, max-age=300');
				}

				res.render('ml-transcript', {
					title: article._source.title + ' | FT Alphaville',
					article: article._source,
					primaryTheme : getMetadata('sections')[0].prefLabel,
					brand: getMetadata('brand')[0].prefLabel,
					withMostRecentPost: true,
					hideCommentCount: true
				});
			}
		} else {
			next();
		}
	})
	.catch(next);
};
