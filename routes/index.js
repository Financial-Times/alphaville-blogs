"use strict";

const express = require('express');
const router = new express.Router();
const elasticSearch = require('alphaville-es-interface');
const headerConfig = require('alphaville-header-config');
const renderPage = require('alphaville-page-render');

function isMarketLive(response) {
	response.hits.hits.map(function(obj) {
		if (obj._source.title.indexOf('Markets Live:') > -1) {
			obj._source.webUrl = '/marketslive/' + obj._id;
			obj.isMarketLive = true;
		} else {
			obj._source.webUrl = '/content/' + obj._id;
			obj.isMarketLive = false;
		}
		obj._source.indexPage = true;
	});
	return response;
}

/* GET home page. */
router.get('/', (req, res) => {

	elasticSearch.searchArticles({
		'method': 'POST',
		'body': JSON.stringify({
			'filter': {
				and: {
					filters: [{
						term: {
							"metadata.primary": {
								value: "brand"
							},
							"metadata.idV1": {
								value: "ZDkyYTVhMzYtYjAyOS00OWI1LWI5ZTgtM2QyYTIzYjk4Y2Jj-QnJhbmRz"
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

	}).then(isMarketLive).then(function(response) {

		renderPage(res, 'index', 'index', {
			title: 'FT Alphaville | FT Alphaville &#8211; Market Commentary &#8211; FT.com',
			searchResults: response.hits.hits,
			headerConfig: headerConfig.setSelected('The Blog'),
			partials: {
				twitterWidget: '../views/partials/twitterWidget.hjs',
				postHeader: '../views/partials/postHeader.hjs',
				commentsConfig: '../node_modules/alphaville-comments-config/main.hjs'
			}
		});

	});
});

router.get('/__access_metadata', (req, res) => {
	res.json({
		access_metadata: [{
			path_regex: "/content/(?<uid>[a-f0-9\-]+)",
			classification: "conditional_registered"
		}, {
			path_regex: "/marketslive/(?<uid>[a-f0-9\-]+)",
			classification: "conditional_registered"
		}, {
			path_regex: "/longroom",
			classification: "conditional_registered"
		}, {
			path_regex: ".*",
			classification: "unconditional"
		}]
	});
});

router.get('/__gtg', (req, res) => {
	res.sendStatus(200);
});

module.exports = router;
