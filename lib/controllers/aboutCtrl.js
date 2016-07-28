'use strict';

const fetch = require('node-fetch');
const Promise = require('bluebird');
const articleService = require('../services/article');

const url = 'http://ftalphaville.ft.com/about-alphaville-2/?json=1';

module.exports = (req, res, next) => {
	const getMostRecentPost = articleService.getRecentPosts();
	const getAboutPage = fetch(`${url}&api_key=${process.env['OLD_WP_API_KEY']}`).then(res => res.json());
	return Promise.all([getAboutPage, getMostRecentPost])
		.spread((aboutPage, mostRecentPost) => {
			let viewModel = {
				title: aboutPage.page.title + ' | FT Alphaville',
				hideCommentCount: true,
				mostRecentPost: mostRecentPost.hits.hits[0]._source,
				article : {
					body: aboutPage.page.content,
					title: aboutPage.page.title
				}
			};
			res.render('about', viewModel);
		})
		.catch(next);
};
