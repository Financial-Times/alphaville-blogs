'use strict';

const articleService = require('../services/article');
const pagination = require('../utils/pagination');
const articleSeriesUrl = require('../../views/helpers/articleSeriesUrl');
const imageHelper = require('../../views/helpers/image');
const cacheHeaders = require('../utils/cacheHeaders');

const itemsPerPage = 30;

module.exports = (req, res, next) => {

	const topicString = req.params.topic

	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	articleService.getArticlesByTopic({
		topic: topicString,
		limit: itemsPerPage,
		offset: (page - 1) * itemsPerPage
	})
	.then(articleService.categorization)
	.then(function(results) {
		const totalPages = Math.ceil(results.total / itemsPerPage);

		results.forEach((article, index) => {
			if (index === 4) {
				article.adAfter = 1;
			}

			if (index === 10) {
				article.adAfter = 2;
			}
		});

		cacheHeaders.setCache(res, 30);

		res.render('search', {
			title: `${topicString} | FT Alphaville`,
			searchTerm: topicString,
			searchResults: results,
			helpers: {
				articleSeriesUrl,
				image: imageHelper
			},
			pagination: results.length ? pagination.getRenderConfig(page, totalPages, req) : false,
			adZone: undefined
		});
	}).catch(next);


};
