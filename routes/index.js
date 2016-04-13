"use strict";

var express = require('express');
var router = express.Router();

// const oDate = require('o-date');

const elasticSearchUrl = process.env.ELASTIC_SEARCH_URL;
const signedFetch = require('signed-aws-es-fetch');
const index = 'v3_api_v2';

const headerConfig = require('../bower_components/alphaville-header/template_config.json');
const envVars = require('../env');

var limit = 10;


headerConfig.navItems.map(function (obj) {
	if (obj.name.indexOf('The Blog')>-1) {
		obj.selected = true;
	}
	return obj
});


/* GET home page. */
router.get('/', (req, res) => {

console.log('*** es: ', `https://${elasticSearchUrl}/${index}/_search`);

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
		}).then(response => response.json()).then(function(response){

			// console.log('response: ', response);
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
	res.json([
		{
			path_regex: ".*",
			classification: "unconditional"
		}
	]);
});
router.get('/__gtg', (req, res) => {
	res.sendStatus(200);
});

module.exports = router;
