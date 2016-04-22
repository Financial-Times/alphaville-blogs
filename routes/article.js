"use strict";

var express = require('express');
var router = express.Router();
var elasticSearch = require('alphaville-es-interface');
var headerConfig = require('alphaville-header-config');

var renderPage = require('alphaville-page-render');


/* GET article page. */
router.get('/:uuid', (req, res) => {

	elasticSearch.getArticle(req.params.uuid).then(function(response){

		renderPage(res, 'article', 'index',{
			title: response._source.title + ' | FT Alphaville',
			article : response._source,
			headerConfig: headerConfig.setSelected('The Blog'),
			partials: {
				twitterWidget: '../views/partials/twitterWidget.hjs',
				postHeader: '../views/partials/postHeader.hjs'
			}
		});

	});

});

module.exports = router;
