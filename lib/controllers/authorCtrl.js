'use strict';

// const elasticSearch = require('alphaville-es-interface');
const articleService = require('../services/article');
const pagination = require('../utils/pagination');
const articleSeriesUrl = require('../../views/helpers/articleSeriesUrl');
const imageHelper = require('../../views/helpers/image');
const cacheHeaders = require('../utils/cacheHeaders');

const itemsPerPage = 30;

module.exports = (req, res, next) => {
	const author = req.query.q;

	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page, 10);
	}

	if (!page || page < 1) {
		page = 1;
	}

	if (!author) {
		return next();
	}

	articleService.getArticlesByAuthor({
		q: author,
		limit: itemsPerPage,
		offset: (page === 1 ? 0 : (page - 1) * itemsPerPage - 1)
	})
	.then(articleService.categorization)
	.then(function(results) {
		const totalPages = Math.ceil(results.hits.total / itemsPerPage);

		cacheHeaders.setCache(res, 30);

		res.render('search', {
			title: `FT Alphaville | ${author}`,
			searchTerm: author,
			searchResults: results.hits.hits,
			helpers: {
				articleSeriesUrl,
				image: imageHelper
			},
			pagination: results.hits.hits.length ? pagination.getRenderConfig(page, totalPages, req) : false
		});
	}).catch(next);
};
