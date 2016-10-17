'use strict';

const elasticSearch = require('alphaville-es-interface');
const articleService = require('../services/article');
const pagination = require('../utils/pagination');
const articleSeriesUrl = require('../../views/helpers/articleSeriesUrl');

const itemsPerPage = 30;

module.exports = (req, res, next) => {
	const searchString = req.query.q;

	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	if (!searchString) {
		res.render('search', {
			title: `FT Alphaville | Search`,
			message: 'Please enter a search term'
		});
		return;
	}

	elasticSearch.searchArticles({
		query: {
			multi_match : {
				query: searchString,
				fields: ["titles", "byline"]
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
			title: `FT Alphaville | Search: ${searchString}`,
			searchTerm: searchString,
			searchResults: results.hits.hits,
			helpers: {
				articleSeriesUrl
			},
			pagination: results.hits.hits.length ? pagination.getRenderConfig(page, totalPages, req) : false
		});
	}).catch(next);
};
