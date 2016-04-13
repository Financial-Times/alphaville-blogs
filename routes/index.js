"use strict";

var express = require('express');
var router = express.Router();

// const oDate = require('o-date');

const elasticSearchUrl = process.env.ELASTIC_SEARCH_URL;
const index = 'v3_api_v2';
const signedFetch = require('signed-aws-es-fetch');

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
  		obj.webUrl = '/marketlive/' + obj._id;
  		obj.isMarketLive = true;
  	} else {
  		obj.webUrl = '/content/' + obj._id;
  		obj.isMarketLive = false;
  	}
  });
  return response;
}

/* GET home page. */
router.get('/', (req, res) => {

	signedFetch(`https://${elasticSearchUrl}/${index}/_search`, {
			'method':'POST',
			'body' : JSON.stringify({
				filter: {
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
				sort : {
					publishedDate:{
						order : 'desc'
					}
				},
				size: limit || 30
			})
		}).then(response => response.json()).then(isMarketLive).then(function(response){

			// res.jsonp		(response)

			res.render('index', {
				title: 'FT Alphaville | FT Alphaville &#8211; Market Commentary &#8211; FT.com',

				assetsBasePath: '/assets/index',
				basePath: '/index',

				isTest: envVars.env === 'test' ? true : false,
				isProd: envVars.env === 'prod' ? true : false,

				searchResults : response.hits.hits,

				headerConfig: headerConfig,
				partials: {
					header: '../bower_components/alphaville-header/main.hjs'
				}
			});

		});



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
