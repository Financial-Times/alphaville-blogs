'use strict';

const elasticSearch = require('alphaville-es-interface');
const articleService = require('../services/article');
const pagination = require('../utils/pagination');

const itemsPerPage = 30;

module.exports = (req, res, next) => {
	const author = req.query.q;

	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	if (!author) {
		return next();
	}

	elasticSearch.searchArticles({
		query: {
			wildcard : {
				byline: `*${author}*`
			}
		},
		sort: {
			publishedDate: {
				order: 'desc'
			}
		},
		size: itemsPerPage,
		from: (page - 1) * itemsPerPage
	})
	.then(articleService.categorization)
	.then(function(results) {
		const totalPages = Math.ceil(results.hits.total / itemsPerPage);

		if (process.env.ENVIRONMENT === 'prod') {
			res.set('Cache-Control', 'public, max-age=30');
		}

		res.render('search', {
			title: `FT Alphaville | ${author}`,
			searchTerm: author,
			searchResults: results.hits.hits,
			pagination: results.hits.hits.length ? pagination.getRenderConfig(page, totalPages, req) : false
		});
	}).catch(next);
};
