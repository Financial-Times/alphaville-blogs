'use strict';
const elasticSearch = require('alphaville-es-interface');

module.exports = (req, res, next) => {
	elasticSearch.getArticle(req.params.uuid).then(function (response) {
		if (response.found === false) {
			next();
			return;
		}

		function getMetadata(taxonomy) {
			return response._source.metadata.filter(function (item) {
				return (item.taxonomy === taxonomy);
			});
		}

		if (process.env.ENVIRONMENT === 'prod') {
			res.set('Cache-Control', 'public, max-age=300');
		}

		if (response.isMarketsLive === true) {
			if (response.isLive === true) {
				res.redirect('/marketslive/' + req.params.uuid);
			} else {
				res.render('ml-transcript', {
					title: response._source.title + ' | FT Alphaville',
					article : response._source,
					primaryTheme : getMetadata('sections')[0].prefLabel,
					brand :  getMetadata('brand')[0].prefLabel,
					oComments: true
				});
			}
		} else {
			res.render('article', {
				title: response._source.title + ' | FT Alphaville',
				article : response._source,
				primaryTheme : getMetadata('sections')[0].prefLabel,
				brand :  getMetadata('brand')[0].prefLabel,
				oComments: true
			});
		}
	}).catch(next);
};
