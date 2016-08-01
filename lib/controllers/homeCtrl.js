'use strict';

const articleService = require('../services/article');

const getArticles = articleService.getArticles;
const categorization = articleService.categorization;

module.exports = (req, res, next) => {
	getArticles()
		.then(categorization)
		.then(function(response) {

			if (process.env.ENVIRONMENT === 'prod') {
				res.set('Cache-Control', 'public, max-age=30');
			}

			res.render('index-list', {
				headerConfig: {
					toggleArticleView: {
						list: true,
						url: '/'
					}
				},
				title: 'FT Alphaville | FT Alphaville &#8211; Market Commentary &#8211; FT.com',
				searchResults: response.hits.hits
			});

		}).catch(next);
};
