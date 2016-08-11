'use strict';

const elasticSearch = require('alphaville-es-interface');

module.exports = (req, res, next) => {
	return elasticSearch.getArticle(req.params.uuid).then((article) => {
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

		let viewModel = {
			title: article._source.title + ' | FT Alphaville',
			article : article._source,
			primaryTheme : getMetadata('sections')[0].prefLabel,
			brand :  getMetadata('brand')[0].prefLabel,
			oComments: true,
			withMostRecentPost: true
		};

		if (article.isMarketsLive === true) {
			if (article.isLive === true) {
				res.redirect('/marketslive/' + req.params.uuid);
			} else {
				viewModel = Object.assign({}, viewModel, {oComments: false, hideCommentCount: true});
				res.render('ml-transcript', viewModel);
			}
		} else {
			res.render('article', viewModel);
		}
	})
	.catch(next);
};
