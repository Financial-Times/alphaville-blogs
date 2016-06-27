"use strict";

const router = require('express').Router();
const elasticSearch = require('alphaville-es-interface');

/* GET search result page. */
router.get('/', (req, res, next) => {

	let searchString = req.query.q;

	elasticSearch.searchArticles({
		'method': 'POST',
		'body': JSON.stringify({
			query: {
				match: {
					titles: searchString
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
	}).then(function(response) {

		if (process.env.ENVIRONMENT === 'prod') {
			res.set('Cache-Control', 'public, max-age=30');
		}

		res.render('search', {
			title: `FT Alphaville | Search: ${searchString}`,
			searchTerm: searchString,
			searchResults: response.hits.hits
		});

	}).catch(next);
});

module.exports = router;
