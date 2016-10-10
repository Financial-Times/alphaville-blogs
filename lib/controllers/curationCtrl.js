'use strict';

const articleService = require('../services/article');
const CurationModel = require('../dbModels/Curation');
const _ = require('lodash');

const getArticles = articleService.getArticles;
const categorization = articleService.categorization;

const itemsPerPage = 30;


const curationOptions = [
	{
		value: 'blog',
		label: 'Simple',
		isSelected: article => Object.keys(article.curation).length === 0,
		applicable: () => true
	},
	{
		value: 'opinion',
		label: 'Opinion',
		isSelected: article => article.curation.isOpinion,
		applicable: article => article._source.authors.length && article._source.authors[0].headshotUrl
	},
	{
		value: 'imagelead',
		label: 'Image lead',
		isSelected: article => article.curation.isImagelead,
		applicable: article => article.withImage
	}
];


function addCurationInformation (article) {
	article.curationOptions = {
		options: []
	};

	article.curationOptions.options = [];

	let enabled = false;
	curationOptions.forEach(curationOption => {
		const option = _.pick(curationOption, ['value', 'label']);
		article.curationOptions.options.push(option);

		if (curationOption.applicable(article)) {
			if (curationOption.isSelected(article)) {
				option.selected = true;
				article.curationOptions.selected = curationOption.value;
			}

			if (option.value !== 'blog') {
				enabled = true;
			}
		} else {
			option.disabled = true;
		}
	});

	if (!enabled) {
		article.curationOptions.disabled = true;
	}

	if (!article.isOpeningQuote && !article.isGuestPost && !article.isFurtherReading && !article.curation.isFirstFT) {
		article.curationOptions.hero = {
			value: 'hero',
			label: 'Hero',
			selected: !!article.curation.isHero
		};
	}
}

exports.index = (req, res, next) => {
	getArticles(itemsPerPage - 1)
		.then(response => categorization(response, true))
		.then(response => {
			if (!response.hits.hits.length) {
				next();
			}

			const heroIndex = response.hits.hits.findIndex(function(item) {
				return item.isHero;
			});

			if (heroIndex) {
				const hero = response.hits.hits.splice(heroIndex, 1);

				if (hero && hero.length) {
					response.hits.hits.unshift(hero[0]);
				}
			}

			response.hits.hits.forEach((article, index) => {
				addCurationInformation(article);

				if (index === 10) {
					article.adAfter = true;
				}
			});

			res.set('Cache-Control', 'private, no-cache, no-store');

			res.render('curation', {
				headerConfig: {
					toggleArticleView: {
						url: '/home',
						grid: true
					}
				},
				title: 'FT Alphaville | FT Alphaville - Market Commentary - FT.com',
				items: response.hits.hits
			});
		}).catch(next);
};


function returnUpdatedTemplate (req, res) {
	getArticles(itemsPerPage - 1)
		.then(response => categorization(response, true))
		.then(response => {
			if (!response.hits.hits.length) {
				res.json({
					status: 'ok'
				});
				return;
			}

			const heroIndex = response.hits.hits.findIndex(function(item) {
				return item.isHero;
			});

			if (heroIndex) {
				const hero = response.hits.hits.splice(heroIndex, 1);

				if (hero && hero.length) {
					response.hits.hits.unshift(hero[0]);
				}
			}

			response.hits.hits.forEach((article, index) => {
				addCurationInformation(article);

				if (index === 10) {
					article.adAfter = true;
				}
			});

			res.render('partials/grid-cards/item-list', {
				layout: false,
				items: response.hits.hits
			}, (err, template) => {
				if (err) {
					console.log(err);
					res.json({
						status: 'ok'
					});
					return;
				}

				res.json({
					status: 'ok',
					html: template
				});
			});
		})
		.catch((err) => {
			console.log(err);
			res.json({
				status: 'ok'
			});
		});
}

exports.save = (req, res) => {
	if (req.query && req.query.uuid && req.query.type) {
		if (req.query.type === 'hero') {
			CurationModel.findOneAndUpdate({
					type: req.query.type
				}, {
					articleId: req.query.uuid,
					type: req.query.type
				}, {
					upsert: true
				})
			.exec()
			.then(() => {
				returnUpdatedTemplate(req, res);
			})
			.catch((err) => {
				console.log("Error while saving curation information", err);
				res.status(503);
				res.json({
					status: 'error',
					msg: "An error occured while saving the information."
				});
			});
		} else {
			CurationModel.findOneAndUpdate({
					articleId: req.query.uuid,
					type: {
						$ne: 'hero'
					}
				}, {
					articleId: req.query.uuid,
					type: req.query.type
				}, {
					upsert: true
				})
			.exec()
			.then(() => {
				returnUpdatedTemplate(req, res);
			})
			.catch((err) => {
				console.log("Error while saving curation information", err);
				res.status(503);
				res.json({
					status: 'error',
					msg: "An error occured while saving the information."
				});
			});
		}
	} else {
		res.status(400);
		res.json({
			status: 'error',
			msg: "Article ID or card type information is missing."
		});
	}
};

exports.delete = (req, res) => {
	if (req.query.type && req.query.type === 'hero') {
		return CurationModel.find({
			type: 'hero'
		})
		.remove()
		.exec()
		.then(() => {
			returnUpdatedTemplate(req, res);
		})
		.catch((err) => {
			console.log("Error while saving curation information", err);
			res.status(503);
			res.json({
				status: 'error',
				msg: "An error occured while saving the information."
			});
		});
	} else if (req.query && req.query.uuid) {
		return CurationModel.find({
			articleId: req.query.uuid,
			type: {
				$ne: 'hero'
			}
		})
		.remove()
		.exec()
		.then(() => {
			returnUpdatedTemplate(req, res);
		})
		.catch((err) => {
			console.log("Error while saving curation information", err);
			res.status(503);
			res.json({
				status: 'error',
				msg: "An error occured while saving the information."
			});
		});
	} else {
		res.status(400);
		res.json({
			status: 'error',
			msg: "Article ID is missing."
		});
	}
};
