"use strict";

const express = require('express');
const router = new express.Router();
const fs = require('fs');
const path = require('path');
const elasticSearch = require('alphaville-es-interface');

const externalPartials = {
	commentsConfig: fs.readFileSync(path.join(__dirname, '../node_modules/alphaville-comments-config/main.handlebars'), 'utf-8'),
	card_hero : fs.readFileSync(path.join(__dirname, '../views/partials/card-hero.handlebars'), 'utf-8'),
	card_podcast : fs.readFileSync(path.join(__dirname, '../views/partials/card-podcast.handlebars'), 'utf-8')
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
			obj._source.cardType = 'marketLive';

		} else {
			obj._webUrl = '/content/' + obj._id;
			obj.isMarketLive = false;
			obj._source.primaryTheme = false;
			obj._source.cardType = '';

			if (getMetadata(obj._source.metadata, {prefLabel:'First FT'}).length > 0) {
				obj._source.primaryTheme = 'BRIEFING: First FT';
				obj._source.cardType = 'firstFt';
			}

		}
		obj.isPodcast = (getMetadata(obj._source.metadata, {prefLabel:'Podcasts'}).length > 0);
		if (obj.isPodcast) {
			obj._source.primaryTheme = 'Podcast: Alphachat';
			obj._source.cardType = 'podcast';
		}

		if(obj._source.title.length > 120){
			obj._source.title = obj._source.title.substring(0, 118) + '&hellip;';
		}



	});
	return response;
}

function testCat(response) {
	// response.hits.hits.forEach(function (obj) {
	//   console.log('primaryTheme: ', obj._source.primaryTheme);
	// });
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
			'size': 100
		})

	}).then(categorization).then(testCat).then(function(response) {

		// res.jsonp(response);

		if (process.env.ENVIRONMENT === 'prod') {
			res.set('Cache-Control', 'public, max-age=30');
		}

		var hero = response.hits.hits.shift();

		res.render('index', {
			title: 'FT Alphaville | FT Alphaville &#8211; Market Commentary &#8211; FT.com',
			searchResults: response.hits.hits,
			hero : hero,
			partials: {
				commentsConfig: externalPartials.commentsConfig,
				card_hero: externalPartials.card_hero,
				card_podcast: externalPartials.card_podcast
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
