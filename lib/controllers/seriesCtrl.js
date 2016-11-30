'use strict';

const articleService = require('../services/article');
const pagination = require('../utils/pagination');
const articleSeriesUrl = require('../../views/helpers/articleSeriesUrl');
const imageHelper = require('../../views/helpers/image');
const cacheHeaders = require('../utils/cacheHeaders');

const itemsPerPage = 30;

module.exports = (req, res, next) => {

	const seriesString = req.params.series

	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	articleService.getArticlesBySeries({
		series: seriesString,
		limit: itemsPerPage,
		offset: (page - 1) * itemsPerPage
	})
	.then(articleService.categorization)
	.then(function(results) {
		const totalPages = Math.ceil(results.hits.total / itemsPerPage);

		results.hits.hits.forEach((article, index) => {
			if (index === 4) {
				article.adAfter = 1;
			}

			if (index === 10) {
				article.adAfter = 2;
			}
		});

		cacheHeaders.setCache(res, 30);

		var renderConfig = {
			title: `${seriesString} | FT Alphaville`,
			searchTerm: seriesString,
			searchResults: results.hits.hits,
			helpers: {
				articleSeriesUrl,
				image: imageHelper
			},
			pagination: results.hits.hits.length ? pagination.getRenderConfig(page, totalPages, req) : false,
			adZone: undefined
		}

		if (seriesString === 'Alphachat') {
			renderConfig.navSelected = 'Alphachat';
		}

		res.render('search', renderConfig);
	}).catch(next);


};
