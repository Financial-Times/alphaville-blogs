'use strict';

const fetch = require('node-fetch');
const Promise = require('bluebird');
const articleService = require('../services/article');

const url = 'http://ftalphaville.ft.com/about-alphaville-2/?json=1';

module.exports = (req, res, next) => {
	const getAboutPage = fetch(`${url}&api_key=${process.env['WP_API_KEY']}`).then(res => res.json());
		return getAboutPage().then((aboutPage) => {
			let viewModel = {
				title: aboutPage.page.title + ' | FT Alphaville',
				hideCommentCount: true,
				article : {
					body: aboutPage.page.content,
					title: aboutPage.page.title
				}
			};
			res.render('about', viewModel);
		}).catch(next);
};
