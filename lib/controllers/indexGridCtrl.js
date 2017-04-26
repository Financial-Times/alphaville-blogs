'use strict';

const articleService = require('../services/article');

const imageHelper = require('../../views/helpers/image');
const cacheHeaders = require('../utils/cacheHeaders');

const itemsPerPage = 30;

module.exports = (req, res, next) => {
	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page, 10);
	}

	if (!page || page < 1) {
		page = 1;
	}

	let itemsToFetch = itemsPerPage;
	if (page === 1) {
		itemsToFetch--;
	}

	articleService.getArticles({
		limit: itemsToFetch,
		offset: (page === 1 ? 0 : (page - 1) * itemsPerPage - 1)
	})
		.then(response => articleService.categorization(response, page === 1))
		.then(articleService.truncateStandfirst)
		.then(response => {
			if (!response.length) {
				next();
			}

			if (page === 1) {
				const heroIndex = response.findIndex(function(item) {
					return item.isHero;
				});

				if (heroIndex >= 0) {
					const hero = response.splice(heroIndex, 1);

					if (hero && hero.length) {
						response.unshift(hero[0]);
					}
				}

				response.forEach((article, index) => {
					if (index === 4) {
						article.smallAdAfter = true;
					}

					if (index === 10) {
						article.adAfter = true;
					}
				});
			}

			cacheHeaders.setCache(res, 30);

			if (req.query.ajax) {
				res.render('partials/grid-cards/item-list', {
					items: response,
					layout: false,
					withoutAds: true,
					helpers: {
						image: imageHelper
					}
				});
			} else {

				res.render('index-grid', {
					headerConfig: {
						toggleArticleView: {
							url: '/indexViewToggler',
							grid: true
						}
					},
					helpers: {
						image: imageHelper
					},
					title: 'FT Alphaville | FT Alphaville - Market Commentary - FT.com',
					items: response,
					adZone: 'alphaville.index'
				});
			}
		}).catch(next);
};
