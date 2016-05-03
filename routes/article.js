"use strict";

const express = require('express');
const router = new express.Router();
const fs = require('fs');
const path = require('path');
const elasticSearch = require('alphaville-es-interface');
const auth = require('alphaville-auth-middleware');

const externalPartials = {
	commentsConfig: fs.readFileSync(path.join(__dirname, '../node_modules/alphaville-comments-config/main.handlebars'), 'utf-8')
};

router.use('/', auth());

/* GET article page. */
router.get('/:uuid', (req, res) => {

	elasticSearch.getArticle(req.params.uuid).then(function(response){
		res.render('article', {
			title: response._source.title + ' | FT Alphaville',
			article : response._source,

			oComments: true,
			partials: {
				commentsConfig: externalPartials.commentsConfig
			}
		});

	});

});

module.exports = router;
