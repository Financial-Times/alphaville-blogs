"use strict";

const express = require('express');
const router = new express.Router();
const fs = require('fs');
const path = require('path');
const elasticSearch = require('alphaville-es-interface');

const externalPartials = {
	commentsConfig: fs.readFileSync(path.join(__dirname, '../node_modules/alphaville-comments-config/main.handlebars'), 'utf-8')
};

function getMetadata(metadata, options) {
	return metadata.filter(function (item) {
		return (item.prefLabel === options.prefLabel);
	});
}


function categorization(response) {
	response.hits.hits.forEach(function(obj) {
		var title = obj._source.title;
		if (title.indexOf('Markets Live:') > -1) {
			obj._webUrl = '/marketslive/' + obj._id;
			obj.isMarketLive = true;
			obj._source.primaryTheme = 'Market Live';
			obj._source.title = obj._source.title.replace(/Markets Live: /, '');

		} else {
			obj._webUrl = '/content/' + obj._id;
			obj.isMarketLive = false;
			obj._source.primaryTheme = false;
			if (getMetadata(obj._source.metadata, {prefLabel:'First FT'}).length > 0) {
				obj._source.primaryTheme = 'BRIEFING: First FT';
			}
			// obj._source.openingHTML = obj._source.openingHTML.substring(0, 119);

		}
		obj.isPodcast = (getMetadata(obj._source.metadata, {prefLabel:'Podcasts'}).length > 0);
		if (obj.isPodcast) {
			obj._source.primaryTheme = 'Podcast: Alphachat';
		}

		if(obj._source.title.length > 120){
			obj._source.title = obj._source.title.substring(0, 118) + '&hellip;';
		}



	});
	return response;
}

function testCat(response) {
	response.hits.hits.forEach(function (obj) {
	  console.log('primaryTheme: ', obj._source.primaryTheme);
	});
  return response;
}


/* GET home page. */
router.get('/', (req, res) => {

	elasticSearch.searchArticles({
		'method': 'POST',
		'body': JSON.stringify({
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

	}).then(categorization).then(testCat).then(function(response) {

		// res.jsonp(response.hits.hits);

		if (process.env.ENVIRONMENT === 'prod') {
			res.set('Cache-Control', 'public, max-age=30');
		}

		res.render('index', {
			title: 'FT Alphaville | FT Alphaville &#8211; Market Commentary &#8211; FT.com',
			searchResults: response.hits.hits,
			partials: {
				commentsConfig: externalPartials.commentsConfig
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
