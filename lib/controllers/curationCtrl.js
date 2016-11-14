'use strict';

const articleService = require('../services/article');
const CurationModel = require('../dbModels/Curation');
const StandfirstCharLimitModel = require('../dbModels/StandfirstCharLimit');
const _ = require('lodash');
const imageHelper = require('../../views/helpers/image');
const cacheHeaders = require('../utils/cacheHeaders');

const itemsPerPage = 30;


const curationOptions = [
	{
		value: 'blog',
		label: 'Default',
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
	if (!article.curation.isOpeningQuote &&
			!article.curation.isGuestPost &&
			!article.curation.isFurtherReading &&
			!article.curation.isFirstFT &&
			!article.curation.isSeriesArticle &&
			!article.curation.isAlphachat &&
			!article.curation.isPodcast) {
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

		article.curationOptions.hero = {
			value: 'hero',
			label: 'Hero',
			selected: !!article.curation.isHero
		};
	}
}

exports.index = (req, res, next) => {
	cacheHeaders.setNoCache(res);

	articleService.getArticles({
		limit: itemsPerPage - 1,
		noCache: true
	})
		.then(response => articleService.categorization(response, true))
		.then(articleService.truncateStandfirst)
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

			StandfirstCharLimitModel
				.findOne({
					type: 'grid'
				})
				.exec()
				.then((limit) => {
					const charLimit = limit ? limit.value || 150 : 150;

					res.render('curation', {
						headerConfig: {
							toggleArticleView: {
								url: '/home',
								grid: true
							}
						},
						helpers: {
							image: imageHelper
						},
						standfirstCharLimit: charLimit,
						something: 'hello',
						title: 'FT Alphaville | FT Alphaville - Market Commentary - FT.com',
						items: response.hits.hits
					});
				})
				.catch(next);
		}).catch(next);
};


function returnUpdatedTemplate (req, res) {
	cacheHeaders.setNoCache(res);

	articleService.getArticles({
		limit: itemsPerPage - 1,
		noCache: true
	})
		.then(response => articleService.categorization(response, true))
		.then(articleService.truncateStandfirst)
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
				helpers: {
					image: imageHelper
				},
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
	cacheHeaders.setNoCache(res);

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
	cacheHeaders.setNoCache(res);

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


exports.standfirstCharLimit = (req, res) => {
	cacheHeaders.setNoCache(res);

	if (!req.query.value || isNaN(req.query.value)) {
		res.status(400);
		res.json({
			status: 'error',
			msg: "The value provided is not a number."
		});
		return;
	}

	StandfirstCharLimitModel.findOneAndUpdate({
			type: 'grid'
		}, {
			type: 'grid',
			value: parseInt(req.query.value, 10)
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
};
