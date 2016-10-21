'use strict';

const fetch = require('node-fetch');

module.exports = function (view, url) {
  return (req, res, next) => {
	  const getStaticPage = fetch(`${url}&api_key=${process.env['WP_API_KEY']}`).then(res => res.json());
	  return getStaticPage.then((staticPage) => {
      let viewModel = {
        title: staticPage.page.title + ' | FT Alphaville',
        hideCommentCount: true,
        article : {
          body: staticPage.page.content,
          title: staticPage.page.title
        }
      };
      res.render(view, viewModel);
	  }).catch(next);
  };
};
