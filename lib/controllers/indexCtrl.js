'use strict';

const articleService = require('../services/article');

const getArticles = articleService.getArticles;
const categorization = articleService.categorization;

const itemsPerPage = 36;

module.exports = (req, res, next) => {
	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	getArticles(itemsPerPage, (page - 1) * itemsPerPage)
		.then(categorization)
		.then((response) => {
			if (process.env.ENVIRONMENT === 'prod') {
				res.set('Cache-Control', 'public, max-age=30');
			}

			if (req.query.ajax) {
				res.render('partials/grid-cards/item-list', {
					items: response.hits.hits,
					layout: false,
					withoutAds: true
				});
			} else {
				res.render('index', {
					headerConfig: {
						toggleArticleView: {
							url: '/home',
							grid: true
						}
					},
					title: 'FT Alphaville | FT Alphaville - Market Commentary - FT.com',
					items: response.hits.hits
				});
			}
		}).catch(next);
};
