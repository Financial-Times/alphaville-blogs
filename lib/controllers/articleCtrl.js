'use strict';

const elasticSearch = require('alphaville-es-interface');

exports.byUuid = function (req, res, next) {
	return elasticSearch.getArticle(req.params[0]).then((article) => {
		if (article.found === false) {
			next();
			return;
		}

		if (article.isMarketsLive !== true) {
			res.redirect(301, article._source.av2WebUrl);
		} else {
			next();
		}
	});
};

exports.byVanity = function (req, res, next) {
	let urlToSearch = req.params[0];
	if (urlToSearch[0] === '/') {
		urlToSearch = urlToSearch.substr(1, urlToSearch.length);
	}
	if (urlToSearch[urlToSearch.length - 1] === '/') {
		urlToSearch = urlToSearch.substr(0, urlToSearch.length - 1);
	}

	urlToSearch = `http://ftalphaville.ft.com/${urlToSearch}/`;

	return elasticSearch.searchArticles({
		method: 'POST',
		body: JSON.stringify({
			query: {
				match: {
					webUrl: urlToSearch
				}
			},
			size: 1
		})
	}).then((article) => {
		if (!article.hits.hits.length) {
			next();
			return;
		}

		article = article.hits.hits[0];

		function getMetadata(taxonomy) {
			return article._source.metadata.filter(function (item) {
				return (item.taxonomy === taxonomy);
			});
		}

		if (process.env.ENVIRONMENT === 'prod') {
			res.set('Cache-Control', 'public, max-age=300');
		}

		if (article.isMarketsLive !== true) {
			res.render('article', {
				title: article._source.title + ' | FT Alphaville',
				article: article._source,
				primaryTheme : getMetadata('sections')[0].prefLabel,
				brand: getMetadata('brand')[0].prefLabel,
				oComments: true,
				withMostRecentPost: true
			});
		} else {
			next();
		}
	})
	.catch(next);
};
