"use strict";

const express = require('express');
const router = new express.Router();
const fs = require('fs');
const path = require('path');
const elasticSearch = require('alphaville-es-interface');

const externalPartials = {
	commentsConfig: fs.readFileSync(path.join(__dirname, '../node_modules/alphaville-comments-config/main.handlebars'), 'utf-8'),
	card_blog : fs.readFileSync(path.join(__dirname, '../views/partials/card-blog.handlebars'), 'utf-8'),
	card_briefing : fs.readFileSync(path.join(__dirname, '../views/partials/card-briefing.handlebars'), 'utf-8'),
	card_hero : fs.readFileSync(path.join(__dirname, '../views/partials/card-hero.handlebars'), 'utf-8'),
	card_marketlive : fs.readFileSync(path.join(__dirname, '../views/partials/card-marketlive.handlebars'), 'utf-8'),
	card_podcast : fs.readFileSync(path.join(__dirname, '../views/partials/card-podcast.handlebars'), 'utf-8')
};

function getMetadata(metadata, options) {
	return metadata.filter(function (item) {
		return (item.prefLabel === options.prefLabel);
	});
}

function ellipsisTrim(str, l){
	var len = l-1;
	return (str.length > len)? str.substring(0, len) + '&hellip;' : str;
}

var isHeroSelected = false;
function categorization(response) {
	response.hits.hits.forEach(function(obj) {

		obj._source.standout = {
			hero : false,
			authorLead : false,
			topicLead : false,
			authorLeadImage : false,
			image : false
		}

		if (obj._source.title.indexOf('Markets Live:') > -1) {
			obj.isMarketLive = true;
			obj._webUrl = '/marketslive/' + obj._id;
			obj.isMarketLive = true;
			obj._source.primaryTheme = 'Market Live';
			obj._source.title = obj._source.title.replace(/Markets Live: /, '');
			obj._source.cardType = 'marketlive';

		} else {
			obj._webUrl = '/content/' + obj._id;
			obj._source.primaryTheme = false;
			obj._source.cardType = 'blogs';

			if (getMetadata(obj._source.metadata, {prefLabel:'First FT'}).length > 0) {
				obj.isBriefing = true;
				obj._source.primaryTheme = 'BRIEFING: First FT';
				obj._source.cardType = 'firstFt';
				obj._source.title = ellipsisTrim(obj._source.title, 240);
				obj._source.summaries = ['Apple executive eyes media business', 'At Goldman, you’re more than a number', 'Universal basic income: money for nothing']

			} else if (getMetadata(obj._source.metadata, {prefLabel:'Podcasts'}).length > 0) {
				obj.isPodcast = true;
				obj._source.primaryTheme = 'Podcast: Alphachat';
				obj._source.cardType = 'podcast';
				obj._source.title = ellipsisTrim(obj._source.title, 60);

			} else {
				obj.isBlog = true;
				if (!isHeroSelected && obj._source.title.indexOf('Alphachat:') === -1 && obj._source.title.indexOf('Further reading') === -1) {
					obj._source.standout.hero = true;
					obj._source.primaryTheme = 'Markets';
					isHeroSelected = true;
				}

			}

			if(obj._source.title.length > 120){
				obj._source.title = ellipsisTrim(obj._source.title, 120);
			}

		}
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
			'size': 50
		})

	}).then(categorization).then(function(response) {

		// res.jsonp(response);

		if (process.env.ENVIRONMENT === 'prod') {
			res.set('Cache-Control', 'public, max-age=30');
		}

		var heroIndex = response.hits.hits.findIndex(function (item) {
			return item._source.standout.hero;
		})
		var hero = response.hits.hits.splice(heroIndex, 1);

		res.render('index', {
			title: 'FT Alphaville | FT Alphaville &#8211; Market Commentary &#8211; FT.com',
			searchResults: response.hits.hits,
			hero : hero,
			partials: {
				commentsConfig: externalPartials.commentsConfig,
				card_blog : externalPartials.card_blog,
				card_briefing : externalPartials.card_briefing,
				card_hero: externalPartials.card_hero,
				card_marketlive : externalPartials.card_marketlive,
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
