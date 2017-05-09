'use strict';

// const elasticSearch = require('alphaville-es-interface');
const articleService = require('../services/article');
const teamService = require('../services/teamService');
const pagination = require('../utils/pagination');
const articleSeriesUrl = require('../../views/helpers/articleSeriesUrl');
const imageHelper = require('../../views/helpers/image');
const cacheHeaders = require('../utils/cacheHeaders');

const itemsPerPage = 30;

module.exports = (req, res, next) => {
	const author = req.params.author;

	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page, 10);
	}

	if (!page || page < 1) {
		page = 1;
	}

	if (!author) {
		return next();
	}

	articleService.getArticlesByAuthor({
		q: author,
		limit: itemsPerPage,
		offset: (page === 1 ? 0 : (page - 1) * itemsPerPage - 1)
	})
	.then(articleService.categorization)
	.then(function(results) {
		const totalPages = Math.ceil(results.total / itemsPerPage);

		cacheHeaders.setCache(res, 30);

		teamService.getMember(author).then(member => {

			res.render('search', {
				title: `FT Alphaville | ${author}`,
				searchTerm: author,
				searchResults: results.items,
				navSelected: author,
				teamMember : member,
				helpers: {
					articleSeriesUrl,
					image: imageHelper
				},
				pagination: results.items.length ? pagination.getRenderConfig(page, totalPages, req) : false
			});

		});


	}).catch(next);
};
