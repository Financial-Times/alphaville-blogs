"use strict";

var express = require('express');
var router = express.Router();
var elasticSearch = require('../lib/elasticSearchApi');
var renderPage = require('../lib/renderPage');

const headerConfig = require('../bower_components/alphaville-header/template_config.json');
const envVars = require('../env');

var limit = 30;

headerConfig.navItems.map(function (obj) {
	if (obj.name.indexOf('The Blog')>-1) {
		obj.selected = true;
	}
	return obj
});


function isMarketLive(response) {
  response.hits.hits.map(function (obj) {
  	if (obj._source.title.indexOf('Markets Live:')>-1) {
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
		'method':'POST',
		'body' : JSON.stringify({
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
					}
				]
			}
		},
		'sort' : {
			publishedDate:{
				order : 'desc'
			}
		},
		'size': limit || 30 })

	}).then(isMarketLive).then(function(response){

		renderPage(res, 'index', 'index',{
			title: 'FT Alphaville | FT Alphaville &#8211; Market Commentary &#8211; FT.com',
			searchResults : response.hits.hits,
			headerConfig: headerConfig,
			partials: {
				twitterWidget: '../views/partials/twitterWidget.hjs',
				postHeader: '../views/partials/postHeader.hjs'
			}
		});

	})
});

router.get('/__access_metadata', (req, res) => {
	res.json({
			access_metadata: [
				{
					path_regex: "/longroom",
					classification: "conditional_registered"
				},
				{
					path_regex: ".*",
					classification: "unconditional"
				}
			]
	});
});

router.get('/__gtg', (req, res) => {
	res.sendStatus(200);
});

module.exports = router;
