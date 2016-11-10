'use strict';

const articleService = require('../services/article');
const pagination = require('../utils/pagination');
const articleSeriesUrl = require('../../views/helpers/articleSeriesUrl');
const imageHelper = require('../../views/helpers/image');
const cacheHeaders = require('../utils/cacheHeaders');

const itemsPerPage = 30;

exports.alphachat = (req, res, next) => {
	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	articleService.getArticles({
		q: 'Alphachat'
	})
	.then(articleService.categorization)
	.then(function(results) {
		const totalPages = Math.ceil(results.hits.total / itemsPerPage);

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
			title: `Alphachat | FT Alphaville`,
			searchTerm: 'Alphachat',
			searchResults: results.hits.hits,
			helpers: {
				articleSeriesUrl,
				image: imageHelper
			},
			pagination: results.hits.hits.length ? pagination.getRenderConfig(page, totalPages, req) : false,
			navSelected: 'Alphachat',
			adZone: 'alpha.chat'
		});
	}).catch(next);
};
