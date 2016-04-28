"use strict";

var express = require('express');
var router = express.Router();
var elasticSearch = require('alphaville-es-interface');
var headerConfig = require('alphaville-header-config');
var auth = require('alphaville-auth-middleware');

var renderPage = require('alphaville-page-render');

var authConfig = {
	checkHeader: process.env['AUTH_HEADER']
};

router.use('/', auth(authConfig), (req, res, next) => {
	if (req.hasOwnProperty('isAuthenticated') && req.isAuthenticated === false ) {
		return renderPage(res, 'barrier', 'index', {
			title: 'FT Alphaville',
			barrierModel: req.barrierModel,
			headerConfig: headerConfig.setSelected('The Blog'),
			partials: {
				twitterWidget: '../views/partials/twitterWidget.hjs',
				barrier: '../bower_components/alphaville-barrier/main.hjs'
			}
		});
	}
	return next();
});

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
