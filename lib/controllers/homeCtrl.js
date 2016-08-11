'use strict';

const articleService = require('../services/article');

module.exports = (req, res, next) => {
	articleService.getArticles()
		.then(articleService.categorization)
		.then(articleService.groupByTime)
		.then(function(results) {
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
				searchResults: results,
				withMostRecentPost: true
			});

		}).catch(next);
};
