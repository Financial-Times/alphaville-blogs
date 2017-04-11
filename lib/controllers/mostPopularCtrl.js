'use strict';

const articleService = require('../services/article');
const articleSeriesUrl = require('../../views/helpers/articleSeriesUrl');
const imageHelper = require('../../views/helpers/image');
const cacheHeaders = require('../utils/cacheHeaders');

const itemsPerPage = 30;

module.exports = (req, res, next) => {
	articleService.getHotArticles({
		limit: itemsPerPage
	})
	.then(articleService.categorization)
	.then(function(results) {
		results.forEach((article, index) => {
			if (index === 4) {
				article.adAfter = 1;
			}

			if (index === 10) {
				article.adAfter = 2;
			}
		});

		cacheHeaders.setCache(res, 30);

		res.render('search', {
			title: `Most popular | FT Alphaville`,
			searchTerm: 'Most popular',
			searchResults: results,
			navSelected: 'Most popular',
			helpers: {
				articleSeriesUrl,
				image: imageHelper
			}
		});
	}).catch(next);
};
