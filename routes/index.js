"use strict";

const express = require('express');
const router = new express.Router();
const fs = require('fs');
const path = require('path');
const elasticSearch = require('alphaville-es-interface');

const externalPartials = {
	commentsConfig: fs.readFileSync(path.join(__dirname, '../node_modules/alphaville-comments-config/main.handlebars'), 'utf-8'),
	card_blog: fs.readFileSync(path.join(__dirname, '../views/partials/card-blog.handlebars'), 'utf-8'),
	card_briefing: fs.readFileSync(path.join(__dirname, '../views/partials/card-briefing.handlebars'), 'utf-8'),
	card_hero: fs.readFileSync(path.join(__dirname, '../views/partials/card-hero.handlebars'), 'utf-8'),
	card_marketlive: fs.readFileSync(path.join(__dirname, '../views/partials/card-marketlive.handlebars'), 'utf-8'),
	card_podcast: fs.readFileSync(path.join(__dirname, '../views/partials/card-podcast.handlebars'), 'utf-8'),
	card_authorLead: fs.readFileSync(path.join(__dirname, '../views/partials/card-authorLead.handlebars'), 'utf-8'),
	card_authorLeadWithImage: fs.readFileSync(path.join(__dirname, '../views/partials/card-authorLeadWithImage.handlebars'), 'utf-8'),
	card_topicLead: fs.readFileSync(path.join(__dirname, '../views/partials/card-topicLead.handlebars'), 'utf-8'),
	comment_counter: fs.readFileSync(path.join(__dirname, '../views/partials/comment-counter.handlebars'), 'utf-8')
};


/*
Bryce Elder
Kadhim Shubber
Izabella Kaminska
David Keohane
Cardiff Garcia
Matt Klein
Joseph Cotterill
Dan McCrum
Paul Murphy
*/


function getHeadshot(authorName) {
	const headshots = [{
		name: 'David Keohane',
		url: 'http://ftalphaville.ft.com/files/2012/08/115_davidKeohane.png'
	}, {
		name: 'Cardiff Garcia',
		url: 'http://ftalphaville.ft.com/files/2012/09/115_cardiffGarcia.png'
	}, {
		name: 'Izabella Kaminska',
		url: 'http://ftalphaville.ft.com/files/2012/10/115_izabellaKaminska.png'
	}];
	const authorHeadshot = headshots.filter(function(item) {
		return (item.name === authorName);
	});
	return (authorHeadshot.length > 0) ? authorHeadshot[0] : false;
}



function filterBy(source, options) {
	return source.filter(function(item) {
		const optionKeys = Object.keys(options);
		let trueCount = 0;
		for (let i = 0; i < optionKeys.length; i++) {
			const key = optionKeys[i];
			if (item[key] === options[key]) {
				trueCount++;
			}
		}
		return (trueCount === optionKeys.length);
	});
}

function ellipsisTrim(str, l) {
	const len = l - 1;
	return (str.length > len) ? str.substring(0, len) + '&hellip;' : str;
}


function categorization(response) {

	console.log('categorization: ');

	let isHeroSelected = false;
	let isAuthorLeadSelected = false;
	let isAuthorLeadWithImageSelected = false;
	let isTopicLeadSelected = false;

	response.hits.hits.forEach(function(obj) {


		function filterMetadataBy(options) {
			return filterBy(obj._source.metadata, options);
		}

		delete obj._source.bodyXML;
		delete obj._source.openingXML;

		obj._source.standout = {
			hero: false,
			authorLead: false,
			topicLead: false,
			authorLeadWithImage: false,
			image: false
		};

		if (obj._source.webUrl.indexOf('marketslive') > -1) {
			obj.isMarketLive = true;
			obj._webUrl = '/content/' + obj._id;
			obj.isMarketLive = true;
			obj._source.primaryTheme = 'Markets Live';
			obj._source.title = obj._source.title.replace(/Markets Live: /, '');
			obj._source.cardType = 'marketlive';

		} else {
			obj._webUrl = '/content/' + obj._id;
			obj._source.primaryTheme = false;
			obj._source.cardType = 'blogs';

			if (filterMetadataBy({ prefLabel: 'First FT' }).length > 0) {
				obj.isBriefing = true;
				obj._source.primaryTheme = 'BRIEFING: First FT';
				obj._source.cardType = 'firstFt';
				obj._source.title = ellipsisTrim(obj._source.title, 240);
				// obj._source.summaries = ['Apple executive eyes media business', 'At Goldman, you’re more than a number', 'Universal basic income: money for nothing']

			} else if (filterMetadataBy({ prefLabel: 'Podcasts' }).length > 0) {
				obj.isPodcast = true;
				obj._source.primaryTheme = 'Podcast: Alphachat';
				obj._source.cardType = 'podcast';
				obj._source.title = ellipsisTrim(obj._source.title, 60);
				// obj._source.mainImage.url = getImageServiceUrl(obj._source.mainImage.url);
				obj._source.summaries = [ellipsisTrim(obj._source.summaries[0], 200)];

			} else if (obj._source.title.indexOf('FT Opening Quote') > -1) {
				obj._source.primaryTheme = 'FT Opening Quote';
				obj.isBlog = true;

			} else if (obj._source.title.indexOf('Further reading') > -1) {
				obj._source.primaryTheme = 'Further reading';
				obj.isBlog = true;

			} else {

				const authors = filterMetadataBy({ taxonomy: 'authors' });
				const author = (authors.length > 0) ? authors[0] : false;
				const authorHeadshot = (author) ? getHeadshot(author.prefLabel) : false;

				if (obj._source.mainImage && !isHeroSelected && obj._source.title.indexOf('Alphachat:') === -1 && obj._source.title.indexOf('Thought for the weekend') === -1) {
					// if (obj._id === '23247ac0-0b0b-3c7b-9f4d-03b0e0b48a09'){
					obj._source.standout.hero = true;
					obj._source.primaryTheme = 'Markets';

					if (!obj._source.mainImage) {
						obj._source.cardType = 'hero';
					} else {
						obj._source.cardType = 'heroWithImage';
					}



					isHeroSelected = true;

				} else if (!isAuthorLeadSelected && (authors.length > 0) && authorHeadshot && obj._source.title.indexOf('Alphachat:') === -1 && obj._source.title.indexOf('Thought for the weekend') === -1) {
					obj.isAuthorLead = true;
					obj._source.standout.authorLead = true;
					obj._source.cardType = 'authorLead';

					const author = authors[0];
					obj._source.primaryTheme = author.prefLabel;
					obj._source.headshot = authorHeadshot.url;

					isAuthorLeadSelected = true;

				} else if (obj._source.mainImage && !isAuthorLeadWithImageSelected && authors.length > 0 && obj._source.title.indexOf('Alphachat:') === -1 && obj._source.title.indexOf('Thought for the weekend') === -1) {
					obj.isAuthorLeadWithImage = true;
					obj._source.standout.authorLeadWithImage = true;
					obj._source.cardType = 'authorLeadWithImage';

					const author = authors[0];
					obj._source.primaryTheme = author.prefLabel;

					isAuthorLeadWithImageSelected = true;

				} else if (!isTopicLeadSelected && obj._source.title.indexOf('Alphachat:') === -1 && obj._source.title.indexOf('Thought for the weekend') === -1) {
					obj.isTopicLead = true;
					obj._source.standout.topicLead = true;
					obj._source.cardType = 'topicLead';
					obj._source.primaryTheme = "Topic: Markets";


					isTopicLeadSelected = true;

				} else {

					obj._source.primaryTheme = filterMetadataBy({ primary: 'section', taxonomy: 'sections' })[0].prefLabel;
					obj.isBlog = true;

				}

			}

			if (obj._source.title.length > 120) {
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
					}, {
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

	}).then(categorization).then(function(response) {

		// res.jsonp(response);

		if (process.env.ENVIRONMENT === 'prod') {
			res.set('Cache-Control', 'public, max-age=30');
		}

		const heroIndex = response.hits.hits.findIndex(function(item) {
			return item._source.standout.hero;
		});
		const hero = response.hits.hits.splice(heroIndex, 1);

		res.render('index', {
			title: 'FT Alphaville | FT Alphaville &#8211; Market Commentary &#8211; FT.com',
			searchResults: response.hits.hits,
			hero: hero,
			partials: {
				commentsConfig: externalPartials.commentsConfig,
				card_blog: externalPartials.card_blog,
				card_briefing: externalPartials.card_briefing,
				card_hero: externalPartials.card_hero,
				card_marketlive: externalPartials.card_marketlive,
				card_podcast: externalPartials.card_podcast,
				card_authorLead: externalPartials.card_authorLead,
				card_authorLeadWithImage: externalPartials.card_authorLeadWithImage,
				card_topicLead: externalPartials.card_topicLead,
				comment_counter: externalPartials.comment_counter
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
			path_regex: "/longroom/content/.*",
			classification: "conditional_alphaville_longroom"
		}, {
			path_regex: "/longroom/.*",
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
