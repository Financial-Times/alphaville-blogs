'use strict';

const elasticSearch = require('alphaville-es-interface');
const _ = require('lodash');
const cache = require('memory-cache');
const cacheTime = 1000 * 60 * 20; //20 minutes

const moment = require('moment-timezone');
moment.tz.setDefault("Europe/London");

/*
 Bryce Elder
 Kadhim Shubber
 Izabella Kaminska
 David Keohane
 Cardiff Garcia
 Matt Klein
 Joseph Cotterill
 Dan McCrum
 Paul Murphy
 */


const headshots = [{
	name: 'Paul Murphy',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:paul-murphy?source=alphaville&width=124'
}, {
	name: 'Bryce Elder',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:bryce-elder?source=alphaville&width=124'
}, {
	name: 'Cardiff Garcia',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:cardiff-garcia?source=alphaville&width=124'
}, {
	name: 'Dan McCrum',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:dan-mccrum?source=alphaville&width=124'
}, {
	name: 'David Keohane',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:david-keohane?source=alphaville&width=124'
}, {
	name: 'Izabella Kaminska',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:izabella-kaminska?source=alphaville&width=124'
}, {
	name: 'Joseph Cotterill',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:joseph-cotterill?source=alphaville&width=124'
}, {
	name: 'Lisa Pollack',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:lisa-pollack?source=alphaville&width=124'
}, {
	name: 'Matthew C Klein',
	url: 'http://image.webservices.ft.com/v1/images/raw/fthead:matthew-c-klein?source=alphaville&width=124'
}];


function getHeadshot(authorName) {

	const authorHeadshot = headshots.filter(function(item) {
		return (item.name === authorName);
	});
	return (authorHeadshot.length > 0) ? authorHeadshot[0] : false;
}

function ellipsisTrim(str, length) {
	const options = {
		length,
		separator: ' '
	};
	return _.truncate(str, options);
}

function categorization(response) {
	response.hits.hits.forEach((obj, index) => {
		function filterMetadataBy(options) {
			return _.filter(obj._source.metadata, options);
		}

		delete obj._source.bodyXML;
		delete obj._source.openingXML;

		if (index === 11) {
			obj.adAfter = true;
		}

		if (obj.isMarketsLive === true) {
			obj._webUrl = '/content/' + obj._id;
			obj._source.primaryTheme = 'Markets Live';
			obj._source.title = obj._source.title.replace(/Markets Live: /, '');
			obj._source.cardType = 'marketslive';

			const authors = filterMetadataBy({ taxonomy: 'authors' });

			if (authors.length > 0) {
				obj._source.authors = authors.join(' &amp; ');
			}
		} else {
			obj._webUrl = '/content/' + obj._id;
			obj._source.cardType = 'blogs';
			obj._source.primaryTheme = filterMetadataBy({ primary: 'section', taxonomy: 'sections' })[0].prefLabel;
			obj.isBlog = true;

			if (obj._source.mainImage && obj._source.mainImage.url) {
				obj.withImage = true;
			}

			if (obj._source.title.length > 120) {
				obj._source.title = ellipsisTrim(obj._source.title, 120);
			}
		}
	});
	return response;
}

function groupByTime (response) {
	const timeCategories = [
		{
			label: 'Today',
			match: date => {
				const today = moment(new Date());
				date = moment(date);

				return (date.year() === today.year()
						&& date.dayOfYear() === today.dayOfYear());
			},
			items: []
		},
		{
			label: 'This week',
			match: date => {
				date = moment(date);
				const today = moment(new Date());
				const startOfWeek = moment().startOf('week').add(1, 'day');

				return (startOfWeek.isBefore(date) && today.isAfter(date));
			},
			items: []
		},
		{
			label: 'Last week',
			match: date => {
				date = moment(date);
				const startOfLastWeek = moment().startOf('week').subtract(6, 'day');
				const endOfLastWeek = moment().endOf('week').subtract(6, 'day');

				return (startOfLastWeek.isBefore(date) && endOfLastWeek.isAfter(date));
			},
			items: []
		},
		{
			label: 'This month',
			match: date => {
				date = moment(date);
				const startOfThisMonth = moment().startOf('month');
				const endOfThisMonth = moment().endOf('month');

				return (startOfThisMonth.isBefore(date) && endOfThisMonth.isAfter(date));
			},
			items: []
		},
		{
			label: 'Last month',
			match: date => {
				date = moment(date);
				const startOfLastMonth = moment().startOf('month').subtract(1, 'month');
				const endOfLastMonth = moment().endOf('month').subtract(1, 'month');

				return (startOfLastMonth.isBefore(date) && endOfLastMonth.isAfter(date));
			},
			items: []
		},
		{
			label: 'Older',
			match: () => {
				return true;
			},
			items: []
		}
	];

	let currentTimeCategory = 0;
	response.hits.hits.forEach((article) => {
		while (!timeCategories[currentTimeCategory].match(new Date(article._source.publishedDate))) {
			currentTimeCategory++;
		}

		timeCategories[currentTimeCategory].items.push(article);
	});


	const results = [];
	let categoryIndex = 0;
	timeCategories.forEach((timeCategory) => {
		if (timeCategory.items.length) {
			categoryIndex++;
			const obj = _.pick(timeCategory, ['label', 'items']);

			if (categoryIndex === 1) {
				obj.mpu = 1;
			} else if (categoryIndex === 3) {
				obj.mpu = 2;
			}
			results.push(obj);
		}
	});

	return results;
}

function getArticles() {
	return elasticSearch.searchArticles({
		'method': 'POST',
		'body': JSON.stringify({
			'filter': {
				or: {
					filters: [{
						term: {
							"metadata.primary": {
								value: "brand"
							},
							"metadata.idV1": {
								value: "ZDkyYTVhMzYtYjAyOS00OWI1LWI5ZTgtM2QyYTIzYjk4Y2Jj-QnJhbmRz" // FT Alphaville
							}
						}
					}, {
						term: {
							"metadata.primary": {
								value: "brand"
							},
							"metadata.idV1": {
								value: "N2NkMjJiYzQtOGI3MC00NTM4LTgzYmYtMTQ3YmJkZGZkODJj-QnJhbmRz" // First FT
							}
						}
					}]
				}
			},
			'sort': {
				publishedDate: {
					order: 'desc'
				}
			},
			'size': 36
		})

	});
}

function getLatestPostsByAuthor(author, count) {
	return elasticSearch.searchArticles({
		'method': 'POST',
		'body': JSON.stringify({
			query: {
				match: {
					byline: author
				}
			},
			'sort': {
				publishedDate: {
					order: 'desc'
				}
			},
			'size': count || 5
		})
	});
}

function getRecentPosts(count) {
	const mostRecentPost = cache.get('mostRecentPost');
	if (mostRecentPost) {
		return Promise.resolve(mostRecentPost);
	}
	return elasticSearch.searchArticles({
		'method': 'POST',
		'body': JSON.stringify({
			'filter': {
				or: {
					filters: [{
						term: {
							"metadata.primary": {
								value: "brand"
							},
							"metadata.idV1": {
								value: "ZDkyYTVhMzYtYjAyOS00OWI1LWI5ZTgtM2QyYTIzYjk4Y2Jj-QnJhbmRz" // FT Alphaville
							}
						}
					}]
				}
			},
			'sort': {
				publishedDate: {
					order: 'desc'
				}
			},
			'size': count || 1
		})
	}).then(articles => {
		cache.put('mostRecentPost', articles, cacheTime);
		return articles;
	});
}

module.exports = {
	categorization,
	getArticles,
	getRecentPosts,
	getLatestPostsByAuthor,
	groupByTime
};
