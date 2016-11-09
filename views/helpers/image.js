'use strict';
const Handlebars = require('handlebars');
const url = require('url');
const _ = require('lodash');

module.exports = (imgUrl, width, quality) => {
	width = parseInt(width, 10) || 250;

	quality = Handlebars.escapeExpression(quality) || 'medium';

	const parsedImgUrl = url.parse(imgUrl, true);

	if (parsedImgUrl.host !== 'image.webservices.ft.com') {
		return `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(imgUrl)}?source=Alphaville&width=${width}&quality=${quality}`;
	}
	if (parsedImgUrl.host === 'image.webservices.ft.com') {
		let pathname = parsedImgUrl.pathname.replace('v1', 'v2');
		return `https://www.ft.com/__origami/service/image${pathname}?source=Alphaville&width=${width}&quality=${quality}`;
	}
	parsedImgUrl.query = _.extend({}, parsedImgUrl.query, {source:'Alphaville', width, quality});
	parsedImgUrl.search = undefined;
	return url.format(parsedImgUrl);
};
