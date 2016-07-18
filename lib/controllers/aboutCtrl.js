'use strict';

const fetch = require('node-fetch');

const url = 'http://ftalphaville.ft.com/about-alphaville-2/?json=1';

module.exports = (req, res, next) => {
	fetch(`${url}&api_key=${process.env['OLD_WP_API_KEY']}`)
		.then(res => res.json())
		.then(json => {
			res.render('about', {
				title: json.page.title + ' | FT Alphaville',
				hideCommentCount: true,
				article : {
					body: json.page.content,
					title: json.page.title
				}
			});
		})
		.catch(next);
};
