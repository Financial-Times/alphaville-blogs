'use strict';
const elasticSearch = require('alphaville-es-interface');
const articleService = require('../services/article');
const Promise = require('bluebird');

module.exports = (req, res, next) => {
	const getArticle = elasticSearch.getArticle(req.params.uuid);
	const getMostRecentPost = articleService.getRecentPosts();

	return Promise.all([getArticle, getMostRecentPost])
		.spread((article, mostRecentPost) => {

				if (article.found === false) {
					next();
					return;
				}

				function getMetadata(taxonomy) {
					return article._source.metadata.filter(function (item) {
						return (item.taxonomy === taxonomy);
					});
				}

				if (process.env.ENVIRONMENT === 'prod') {
					res.set('Cache-Control', 'public, max-age=300');
				}

				const viewModel = {
					title: article._source.title + ' | FT Alphaville',
					article : article._source,
					primaryTheme : getMetadata('sections')[0].prefLabel,
					mostRecentPost: mostRecentPost.hits.hits[0]._source,
					brand :  getMetadata('brand')[0].prefLabel,
					oComments: true
				};

				if (article.isMarketsLive === true) {
					if (article.isLive === true) {
						res.redirect('/marketslive/' + req.params.uuid);
					} else {
						res.render('ml-transcript', viewModel);
					}
				} else {
					res.render('article', viewModel);
				}
		})
		.catch(next);
};
