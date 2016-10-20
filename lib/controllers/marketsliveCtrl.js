'use strict';

const elasticSearch = require('alphaville-es-interface');
const articleService = require('../services/article');
const liveSessionService = require('../services/liveSessions');
const WpApi = require('alphaville-marketslive-wordpress-api');
const pagination = require('../utils/pagination');

const itemsPerPage = 20;

exports.index = function (req, res, next) {
	res.set('Cache-Control', 'private, no-cache, no-store');

	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	const render = function () {
		articleService.getMarketsliveArticles(itemsPerPage, (page - 1) * itemsPerPage)
			.then(response => {
				if (!response.hits.hits.length) {
					return next();
				}

				const transcripts = articleService.groupByTime(response);

				const totalPages = Math.ceil(response.hits.total / itemsPerPage);

				res.render('ml-index', {
					title: 'Marketslive index | FT Alphaville',
					transcripts: transcripts,
					pagination: pagination.getRenderConfig(page, totalPages, req),
					navSelected: 'Markets Live'
				});
			}).catch(next);
	};

	liveSessionService.latest().then((session) => {
		if (session && req.query.force !== 'home') {
			res.redirect(session.url);
		} else {
			render();
		}
	}).catch(() => {
		render();
	});
};

exports.about = function (req, res) {
	if (process.env.ENVIRONMENT === 'prod') {
		res.set('Cache-Control', 'public, max-age=300');
	}

	res.render('ml-about', {
		title: "About Markets Live | FT Alphaville"
	});
};



function renderLowerEnvItem (req, res, next) {
	const wpPath = req.params[0];
	const wpApi = new WpApi(wpPath);

	Promise.all([wpApi.init(), wpApi.catchup()]).then((results) => {
		const status = results[0];
		const catchup = results[1];

		if (status.success === true) {
			if (status.data.status === 'inprogress') {
				const renderData = {
					title: 'MarketsLive',
					articleId: status.data.post_uuid,
					apiUrl: `${process.env.WP_URL}/marketslive/${wpPath}`,
					articleUrl: `${process.env.APP_URL}/marketslive/${wpPath}`,
					navSelected: 'Markets Live'
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
	return elasticSearch.getArticleByUuid(req.params[0]).then((article) => {
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
		query: {
			match: {
				webUrl: urlToSearch
			}
		},
		size: 1
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
				res.set('Cache-Control', 'private, no-cache, no-store');

				const wpApi = new WpApi(req.params[0]);

				const renderData = {
					title: article._source.title,
					articleId: article._id,
					apiUrl: `${process.env.WP_URL}/marketslive/${urlPath}`,
					articleUrl: `${process.env.APP_URL}/marketslive/${urlPath}`,
					navSelected: 'Markets Live'
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

				if (req.query.ajax) {
					res.render('ml-transcript-body', {
						article: article._source,
						layout: false
					});
				} else {
					res.render('ml-transcript', {
						title: article._source.title + ' | FT Alphaville',
						article: article._source,
						articleId: article._id,
						primaryTheme : getMetadata('sections')[0].prefLabel,
						brand: getMetadata('brand')[0].prefLabel,
						hideCommentCount: true,
						navSelected: 'Markets Live'
					});
				}
			}
		} else {
			next();
		}
	})
	.catch(next);
};
