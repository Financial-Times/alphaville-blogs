'use strict';
const Handlebars = require('handlebars');
const url = require('url');
const _ = require('lodash');

module.exports = (imgUrl, width, quality) => {
	console.log(imgUrl, 'quality 1', quality);
	width = parseInt(width, 10) || 250;
	quality = Handlebars.escapeExpression(quality) || 'medium';
	console.log(imgUrl, 'quality 2', quality);
	const parsedImgUrl = url.parse(imgUrl, true);
	if (parsedImgUrl.host !== 'image.webservices.ft.com') {
		return `https://image.webservices.ft.com/v1/images/raw/${encodeURIComponent(imgUrl)}?source=Alphaville&width=${width}&quality=${quality}`;
	}
	parsedImgUrl.query = _.extend({}, parsedImgUrl.query, {source:'Alphaville', width, quality});
	parsedImgUrl.search = undefined;
	return url.format(parsedImgUrl);
};
