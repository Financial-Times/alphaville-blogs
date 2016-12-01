'use strict';

const articleService = require('../services/article');
const articleSeriesUrl = require('../../views/helpers/articleSeriesUrl');
const imageHelper = require('../../views/helpers/image');
const cacheHeaders = require('../utils/cacheHeaders');

const itemsPerPage = 10;

module.exports = (req, res, next) => {
	articleService.getMostCommentedArticles({
		limit: itemsPerPage
	})
	.then(articleService.categorization)
	.then(function(results) {
		results.hits.hits.forEach((article, index) => {
			if (index === 4) {
				article.adAfter = 1;
			}

			if (index === 10) {
				article.adAfter = 2;
			}
		});

		cacheHeaders.setCache(res, 30);

		res.render('search', {
			title: `Most commented | FT Alphaville`,
			searchTerm: 'Most commented',
			searchResults: results.hits.hits,
			helpers: {
				articleSeriesUrl,
				image: imageHelper
			}
		});
	}).catch(next);
};
