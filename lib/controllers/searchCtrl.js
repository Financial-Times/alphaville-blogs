'use strict';
const elasticSearch = require('alphaville-es-interface');
const articleService = require('../services/article');

module.exports = (req, res, next) => {
	const searchString = req.query.q;

	Promise.all([elasticSearch.searchArticles({
		'method': 'POST',
		'body': JSON.stringify({
			query: {
				multi_match : {
					query: searchString,
					fields: ["titles", "byline"]
				}
			},
			'filter': {
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
			'sort': {
				publishedDate: {
					order: 'desc'
				}
			},
			'size': 30
		})
	}), articleService.getRecentPosts()]).then(function(response) {
		const articles = response[0];
		const mostRecentPost = response[1];

		if (process.env.ENVIRONMENT === 'prod') {
			res.set('Cache-Control', 'public, max-age=30');
		}

		res.render('search', {
			title: `FT Alphaville | Search: ${searchString}`,
			searchTerm: searchString,
			searchResults: articles.hits.hits,
			mostRecentPost: mostRecentPost.hits.hits[0]._source,
		});

	}).catch(next);
};
