'use strict';

const articleService = require('../services/article');
const liveSessionService = require('../services/liveSessions');
const pagination = require('../utils/pagination');
const cacheHeaders = require('../utils/cacheHeaders');

const itemsPerPage = 20;

exports.index = function (req, res, next) {
	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	const render = function () {
		articleService.getMarketsliveArticles({
			limit: itemsPerPage,
			offset: (page - 1) * itemsPerPage
		})
			.then(response => {
				if (!response.hits.hits.length) {
					return next();
				}

				const transcripts = articleService.groupByTime(response);

				let index = 0;
				transcripts.forEach((category) => {
					if (category && category.items) {
						category.items.forEach((article) => {
							if (index === 4) {
								article.adAfter = 1;
							}

							if (index === 10) {
								article.adAfter = 2;
							}

							index++;
						});
					}
				});

				const totalPages = Math.ceil(response.hits.total / itemsPerPage);

				res.render('ml-index', {
					title: 'Marketslive index | FT Alphaville',
					transcripts: transcripts,
					pagination: pagination.getRenderConfig(page, totalPages, req),
					navSelected: 'Markets Live',
					adZone: 'markets.live'
				});
			}).catch(next);
	};

	liveSessionService.latest().then((session) => {
		if (session && req.query.force !== 'home') {
			cacheHeaders.setNoCache(res);
			res.redirect(session.url);
		} else {
			cacheHeaders.setCache(res, 300);
			render();
		}
	}).catch(() => {
		render();
	});
};

exports.about = function (req, res) {
	cacheHeaders.setCache(res, 300);

	res.render('ml-about', {
		title: "About Markets Live | FT Alphaville",
		navSelected: 'About Markets Live',
		adZone: 'markets.live'
	});
};


exports.byUuid = function (req, res, next) {
	return articleService.getArticle(`/marketslive/${req.params[0]}`).then((article) => {
		if (article.found !== true) {
			next();
			return;
		}

		cacheHeaders.setNoCache(res);

		if (article.isMarketsLive === true) {
			res.redirect(301, article._source.av2WebUrl);
		} else {
			next();
		}
	});
};

exports.byVanity = function (req, res, next) {
	return articleService.getArticle(`/marketslive/${req.params[0]}`).then((article) => {
		if (!article || article.found === false) {
			cacheHeaders.setNoCache(res);

			return next();
		}

		function getMetadata(taxonomy) {
			return article._source.metadata.filter(function (item) {
				return (item.taxonomy === taxonomy);
			});
		}

		if (article.isMarketsLive === true) {
			if (article.isLive === true) {
				cacheHeaders.setNoCache(res);

				const renderData = {
					title: article._source.originalTitle,
					articleId: article._id,
					apiUrl: `${process.env.WP_URL}/marketslive/${req.params[0]}`,
					articleUrl: `${process.env.APP_URL}/marketslive/${req.params[0]}`,
					navSelected: 'Markets Live',
					adZone: 'markets.live',
					hideFooter: true,
					hideTopAd: true
				};

				if (article._source.comments.enabled !== false) {
					res.render('ml-live', renderData);
				} else {
					res.render('ml-live_without_comments', renderData);
				}
			} else {
				cacheHeaders.setCache(res, 300);

				if (req.query.ajax) {
					res.render('ml-transcript-body', {
						article: article._source,
						layout: false
					});
				} else {
					res.render('ml-transcript', {
						title: article._source.originalTitle + ' | FT Alphaville',
						article: article._source,
						articleId: article._id,
						primaryTheme : getMetadata('sections')[0].prefLabel,
						brand: getMetadata('brand')[0].prefLabel,
						hideCommentCount: true,
						navSelected: 'Markets Live',
						adZone: 'markets.live'
					});
				}
			}
		} else {
			cacheHeaders.setNoCache(res);

			next();
		}
	})
	.catch(next);
};
