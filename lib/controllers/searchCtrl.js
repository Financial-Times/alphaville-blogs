'use strict';

const elasticSearch = require('alphaville-es-interface');
const articleService = require('../services/article');
const pagination = require('../utils/pagination');

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

	elasticSearch.searchArticles({
		method: 'POST',
		body: JSON.stringify({
			query: {
				multi_match : {
					query: searchString,
					fields: ["titles", "byline"]
				}
			},
			filter: {
				or: {
					filters: [{
						term: {
							"metadata.primary": {
								value: "brand"
							},
							"metadata.idV1": {
								value: "ZDkyYTVhMzYtYjAyOS00OWI1LWI5ZTgtM2QyYTIzYjk4Y2Jj-QnJhbmRz" // FT Alphaville
							}
						}
					},{
						term: {
							"metadata.primary": {
								value: "brand"
							},
							"metadata.idV1": {
								value: "N2NkMjJiYzQtOGI3MC00NTM4LTgzYmYtMTQ3YmJkZGZkODJj-QnJhbmRz" // First FT
							}
						}
					}]
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
	})
	.then(articleService.categorization)
	.then(function(results) {
		if (!results.hits.hits.length) {
			return next();
		}

		const totalPages = Math.ceil(results.hits.total / itemsPerPage);

		if (process.env.ENVIRONMENT === 'prod') {
			res.set('Cache-Control', 'public, max-age=30');
		}

		res.render('search', {
			title: `FT Alphaville | Search: ${searchString}`,
			searchTerm: searchString,
			searchResults: results.hits.hits,
			withMostRecentPost: true,
			pagination: pagination.getRenderConfig(page, totalPages, req)
		});

	}).catch(next);
};
