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

/* GET article page. */
router.get('/:uuid', (req, res) => {

	var uuid = req.params.uuid;

	signedFetch(`https://${elasticSearchUrl}/${index}/item/${uuid}`).then(response => response.json()).then(function(response){


		res.render('article', {
			title: response._source.title + ' | FT Alphaville',

			assetsBasePath: '/assets/index',
			basePath: '/index',

			isTest: envVars.env === 'test' ? true : false,
			isProd: envVars.env === 'prod' ? true : false,

			article : response._source,

			headerConfig: headerConfig,
			partials: {
				header: '../bower_components/alphaville-header/main.hjs'
			}
		});

	});

});

module.exports = router;
