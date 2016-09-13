'use strict';

const articleService = require('../services/article');

const getArticles = articleService.getArticles;
const categorization = articleService.categorization;

const itemsPerPage = 30;

module.exports = (req, res, next) => {
	let page = 1;
	if (req.query.page) {
		page = parseInt(req.query.page);
	}

	if (!page || page < 1) {
		page = 1;
	}

	let itemsToFetch = itemsPerPage;
	if (page === 1) {
		itemsToFetch--;
	}

	getArticles(itemsToFetch, (page === 1 ? 0 : (page - 1) * itemsPerPage - 1))
		.then(response => {
			return categorization(response, page === 1);
		})
		.then(response => {
			if (!response.hits.hits.length) {
				next();
			}

			if (page === 1) {
				const heroIndex = response.hits.hits.findIndex(function(item) {
					return item.isHero;
				});

				if (heroIndex) {
					const hero = response.hits.hits.splice(heroIndex, 1);

					if (hero && hero.length) {
						response.hits.hits.unshift(hero[0]);
					}
				}
			}

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
