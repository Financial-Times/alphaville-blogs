"use strict";

const express = require('express');
const router = new express.Router();
const elasticSearch = require('alphaville-es-interface');
const auth = require('alphaville-auth-middleware');

router.use('/', auth());


/* GET article page. */
router.get('/:uuid', (req, res, next) => {
	elasticSearch.getArticle(req.params.uuid).then(function (response) {
		if (response.found === false) {
			next();
			return;
		}

		function getMetadata(taxonomy) {
			return response._source.metadata.filter(function (item) {
				return (item.taxonomy === taxonomy);
			});
		}

		// res.jsonp(response._source);

		if (process.env.ENVIRONMENT === 'prod') {
			res.set('Cache-Control', 'public, max-age=300');
		}

		if (response.isMarketsLive === true) {
			if (response.isLive) {
				res.redirect('/marketslive/' + req.params.uuid);
			} else {
				res.render('ml-transcript', {
					title: response._source.title + ' | FT Alphaville',
					article : response._source,
					primaryTheme : getMetadata('sections')[0].prefLabel,
					brand :  getMetadata('brand')[0].prefLabel,
					oComments: true
				});
			}
		} else {
			res.render('article', {
				title: response._source.title + ' | FT Alphaville',
				article : response._source,
				primaryTheme : getMetadata('sections')[0].prefLabel,
				brand :  getMetadata('brand')[0].prefLabel,
				oComments: true
			});
		}
	}).catch(next);

});

module.exports = router;
