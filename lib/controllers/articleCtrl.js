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
			res.redirect(301, article.av2WebUrl);
		} else {
			next();
		}
	});
};

exports.byVanity = function (req, res, next) {
	return articleService.getArticle(`/article/${req.params[0]}`).then((article) => {
		if (!article) {
			return next();
		}

		if (article.av2WebUrl !== req.path) {
			return res.redirect(301, article.av2WebUrl);
		}

		if (article.byline && article.authors.length) {
			article.authors.forEach(author => {
				if (author.isAlphavilleEditor) {
					article.byline = article.byline.replace(
						new RegExp(author.name),
						`<a class="article__byline-tag" href="${author.url}" data-trackable="author">${author.name}</a>`
					);
				} else {
					article.byline = article.byline.replace(
						new RegExp(author.name),
						`<span class="article__byline-tag">${author.name}</span>`
					);
				}
			});
		}

		cacheHeaders.setCache(res, 300);

		if (article.isMarketsLive !== true) {
			if (req.query.ajax) {
				res.render('article-body', {
					article: article,
					layout: false,
					articleId: article.id
				});
			} else {
				articleService.getArticles({
					limit: 5
				})
				.then(response => response.items.filter(item => item.id !== article.id)
						.filter(item => !item.isMarketsLive)
						.filter(item => !item.isFirstFT)
						.shift())
				.then(mostRecentPost => {
					// Temporary addition until the comments are replaced
					const commentsUseCoralMilestoneDate = process.env.COMMENTS_USE_CORAL_MILESTONE_DATE;
					const commentsUseCoralTalk = process.env.COMMENTS_USE_CORAL_TALK === 'true';
					const commentsUseCoralTalkQuerystring = req.query.useCoralTalk;

					let useCoralTalk = false;
					if ((commentsUseCoralMilestoneDate && commentsUseCoralTalk && article.firstPublishedDate > commentsUseCoralMilestoneDate) || commentsUseCoralTalkQuerystring) {
						useCoralTalk = true;
					}

					res.render('article', {
						title: article.title + ' | FT Alphaville',
						article: article,
						articleId: article.id,
						mostRecentPost: mostRecentPost,
						helpers: {
							articleSeriesUrl,
							image: imageHelper
						},
						useCoralTalk,
						oComments: true,
						adZone: (article.seriesArticles && article.seriesArticles.series.prefLabel === 'Alphachat' ? 'alpha.chat' : undefined)
					});
				});

			}
		} else {
			next();
		}
	})
	.catch(next);
};
