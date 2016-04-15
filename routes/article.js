"use strict";

var express = require('express');
var router = express.Router();
var elasticSearch = require('../lib/elasticSearchApi');
var renderPage = require('../lib/renderPage');

const headerConfig = require('../bower_components/alphaville-header/template_config.json');
const envVars = require('../env');

headerConfig.navItems.map(function (obj) {
	if (obj.name.indexOf('The Blog')>-1) {
		obj.selected = true;
	}
	return obj
});

/* GET article page. */
router.get('/:uuid', (req, res) => {

	elasticSearch.getArticle(req.params.uuid).then(function(response){

		renderPage(res, 'article', 'index',{
			title: response._source.title + ' | FT Alphaville',
			article : response._source,
			headerConfig: headerConfig,
			partials: {
				twitterWidget: '../views/partials/twitterWidget.hjs',
				postHeader: '../views/partials/postHeader.hjs'
			}
		});

	});

});

module.exports = router;
