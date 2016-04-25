"use strict";

var express = require('express');
var router = express.Router();
var elasticSearch = require('alphaville-es-interface');
var headerConfig = require('alphaville-header-config');
var auth = require('alphaville-auth-middleware');
var env = process.env['ENVIRONMENT'] || 'test';

var renderPage = require('alphaville-page-render');

var authConfig = {
	checkHeader: process.env['AUTH_HEADER'],
	barrierView: 'barrier',
	viewModel: {
		headerConfig: headerConfig.setSelected('The Blog'),
		assetsBasePath: '/assets/index',
		basePath: '/index',
		isTest: env === 'test' ? true : false,
		isProd: env === 'prod' ? true : false,
		partials: {
			header: '../bower_components/alphaville-header/main.hjs',
			footer: '../bower_components/alphaville-footer/main.hjs',
			body: '../bower_components/alphaville-barrier/main.hjs'
		}
	}
};

router.use('/', auth(authConfig));

/* GET article page. */
router.get('/:uuid', (req, res) => {

	elasticSearch.getArticle(req.params.uuid).then(function(response){

		renderPage(res, 'article', 'index',{
			title: response._source.title + ' | FT Alphaville',
			article : response._source,
			headerConfig: headerConfig.setSelected('The Blog'),
			oComments: true,
			partials: {
				twitterWidget: '../views/partials/twitterWidget.hjs',
				postHeader: '../views/partials/postHeader.hjs',
				commentsConfig: '../node_modules/alphaville-comments-config/main.hjs'
			}
		});

	});

});

module.exports = router;
