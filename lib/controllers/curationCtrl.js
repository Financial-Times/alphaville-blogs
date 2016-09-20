'use strict';

const articleService = require('../services/article');
const Curation = require('../dbModels/Curation');
const _ = require('lodash');

const getArticles = articleService.getArticles;
const categorization = articleService.categorization;

const itemsPerPage = 30;


const curationOptions = [
	{
		value: 'blog',
		label: 'Simple',
		isSelected: article => article.isBlog,
		applicable: () => true
	},
	{
		value: 'opinion',
		label: 'Opinion',
		isSelected: article => article.isOpinion,
		applicable: article => article._source.authors.length && article._source.authors[0].headshotUrl
	}
];


function addCurationInformation (article) {
	article.curation = {
		options: []
	};

	article.curation.options = [];

	curationOptions.forEach(curationOption => {
		if (curationOption.applicable(article)) {
			const option = _.pick(curationOption, ['value', 'label']);
			if (curationOption.isSelected(article)) {
				option.selected = true;
				article.curation.selected = curationOption.value;
			}
			article.curation.options.push(option);
		}
	});
}

exports.index = (req, res, next) => {
	getArticles(itemsPerPage - 1)
		.then(response => {
			return categorization(response, true);
		})
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

			response.hits.hits.forEach((article) => {
				addCurationInformation(article);
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
		.then(response => {
			return categorization(response, true);
		})
		.then(response => {
			if (!response.hits.hits.length) {
				res.json({
					status: 'ok'
				});
				return;
			}

			for (let i = 0; i < response.hits.hits.length; i++) {
				const article = response.hits.hits[i];
				if (article._id === req.body.uuid) {
					addCurationInformation(article);

					res.render('partials/grid-cards/item-list', {
						layout: false,
						withoutAds: true,
						items: [
							article
						]
					}, (err, template) => {
						if (err) {
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
					return;
				}
			}

			res.json({
				status: 'ok'
			});
		})
		.catch(() => {
			res.json({
				status: 'ok'
			});
		});
}

exports.save = (req, res) => {
	if (req.body && req.body.uuid && req.body.type) {
		Curation.findOneAndUpdate({
				articleId: req.body.uuid
			}, {
				articleId: req.body.uuid,
				type: req.body.type
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
		res.status(400);
		res.json({
			status: 'error',
			msg: "Article ID or card type information is missing."
		});
	}
};

exports.delete = (req, res) => {
	if (req.body && req.body.uuid) {
		return Curation.find({
			articleId: req.body.uuid
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

exports.list = (req, res) => {
	Curation.find({}, '-_id').exec().then((curationList) => {
		const mapping = {};
		curationList.forEach((item) => {
			mapping[item.articleId] = item.type;
		});

		res.json(mapping);
	}).catch((err) => {
		console.log('Error fetching the curation list', err);
		res.status(503);
		res.json({
			msg: 'Error fetching curation list.'
		});
	});
};
