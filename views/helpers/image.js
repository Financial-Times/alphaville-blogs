'use strict';
const Handlebars = require('handlebars');

module.exports = (url, width, quality) => {
	width = parseInt(width, 10) || 250;
	quality = Handlebars.escapeExpression(quality) || 'low';
	return `https://image.webservices.ft.com/v1/images/raw/${encodeURIComponent(url)}?source=Alphaville&width=${width}&fit=scale-down&quality=${quality}`;
};
