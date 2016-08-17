'use strict';

const elasticSearch = require('alphaville-es-interface');

exports.byUuid = function (req, res, next) {
	return elasticSearch.getArticle(req.params.uuid).then((article) => {
		if (article.found === false) {
			next();
			return;
		}

		if (article.isMarketsLive === true) {
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


			if (article.isLive === true) {
				res.redirect('/marketslive/' + req.params.uuid);
			} else {
				viewModel = Object.assign({}, viewModel, {oComments: false, hideCommentCount: true});
				res.render('ml-transcript', viewModel);
			}
		} else {
			res.redirect(article._source.webUrl);
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
		'method': 'POST',
		'body': JSON.stringify({
			query: {
				match: {
					webUrl: urlToSearch
				}
			},
			'size': 1
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
