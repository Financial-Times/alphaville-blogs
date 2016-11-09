'use strict';
const Handlebars = require('handlebars');
const url = require('url');
const _ = require('lodash');

module.exports = (imgUrl, width, quality) => {
	width = parseInt(width, 10) || 250;

	quality = Handlebars.escapeExpression(quality) || 'medium';

	const parsedImgUrl = url.parse(imgUrl, true);

	if (parsedImgUrl.host !== 'image.webservices.ft.com') {
		return `https://image.webservices.ft.com/v1/images/raw/${encodeURIComponent(imgUrl)}?source=Alphaville&width=${width}&quality=${quality}`;
	}
	/*
	// transform image service v1 URLs to v2
	if (parsedImgUrl.host === 'image.webservices.ft.com') {
		let pathname = parsedImgUrl.pathname.replace('v1', 'v2');
		return `https://www.ft.com/__origami/service/image${pathname}?source=Alphaville&width=${width}&quality=${quality}`;
	}*/
	parsedImgUrl.query = _.extend({}, parsedImgUrl.query, {source:'Alphaville', width, quality});
	parsedImgUrl.search = undefined;
	return url.format(parsedImgUrl);
};
