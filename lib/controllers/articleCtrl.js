'use strict';

const articleService = require('../services/article');
const articleSeriesUrl = require('../../views/helpers/articleSeriesUrl');
const imageHelper = require('../../views/helpers/image');
const cacheHeaders = require('../utils/cacheHeaders');

exports.byUuid = function (req, res, next) {
	return articleService.getArticle(`/article/${req.params[0]}`).then((article) => {
		if (article.found === false) {
			next();
			return;
		}

		if (article.isMarketsLive !== true) {
			res.redirect(301, article._source.av2WebUrl);
		} else {
			next();
		}
	});
};

exports.byVanity = function (req, res, next) {
	return articleService.getArticle(`/article/${req.params[0]}`).then((article) => {
		if (!article || !article._source) {
			return next();
		}

		if (article._source.byline && article._source.authors.length) {
			article._source.authors.forEach(author => {
				if (author.isAlphavilleEditor) {
					article._source.byline = article._source.byline.replace(
						new RegExp(author.name),
						`<a class="article__byline-tag" href="${author.url}" data-trackable="author">${author.name}</a>`
					);
				}
			});
		}

		function getMetadata(taxonomy) {
			return article._source.metadata.filter(function(item) {
				return (item.primary === taxonomy);
			});
		}

		cacheHeaders.setCache(res, 300);

		if (article.isMarketsLive !== true) {
			if (req.query.ajax) {
				res.render('article-body', {
					article: article._source,
					layout: false,
					articleId: article._id
				});
			} else {
				articleService.getArticles({
					limit: 5
				})
				.then(response => response.hits.hits.filter(item => item._id !== article._id)
						.filter(item => !item.isMarketsLive)
						.filter(item => !item.isFirstFT)
						.shift())
				.then(mostRecentPost => {

					res.render('article', {
						title: article._source.title + ' | FT Alphaville',
						article: article._source,
						articleId: article._id,
						mostRecentPost: mostRecentPost,
						helpers: {
							articleSeriesUrl,
							image: imageHelper
						},
						oComments: true,
						adZone: (article._source.seriesArticles && article._source.seriesArticles.series.prefLabel === 'Alphachat' ? 'alpha.chat' : undefined)
					});
				});

			}
		} else {
			next();
		}
	})
	.catch(next);
};
