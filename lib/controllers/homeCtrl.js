'use strict';

const articleService = require('../services/article');
const pagination = require('../utils/pagination');
const articleSeriesUrl = require('../../views/helpers/articleSeriesUrl');
const imageHelper = require('../../views/helpers/image');

const itemsPerPage = 30;

module.exports = (req, res, next) => {
	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	articleService.getArticles(null, itemsPerPage, (page - 1) * itemsPerPage)
		.then(articleService.categorization)
		.then(function(response) {
			if (!response.hits.hits.length) {
				return next();
			}

			const results = articleService.groupByTime(response);

			let index = 0;
			results.forEach((category) => {
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

			if (process.env.ENVIRONMENT === 'prod') {
				res.set('Cache-Control', 'public, max-age=30');
			}

			res.render('index-list', {
				headerConfig: {
					toggleArticleView: {
						list: true,
						url: '/'
					}
				},
				title: 'FT Alphaville | FT Alphaville - Market Commentary - FT.com',
				searchResults: results,
				helpers: {
					articleSeriesUrl,
					image: imageHelper
				},
				pagination: pagination.getRenderConfig(page, totalPages, req)
			});
		}).catch(next);
};
