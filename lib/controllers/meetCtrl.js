'use strict';

const articleService = require('../services/article');
const teamService = require('alphaville-team-members');
const _ = require('lodash');

module.exports = (req, res, next) => {
	return teamService.getMembers().then((teamMembers) => {
		const selectedMember = {
			data: _.find(teamMembers, {
				slug: req.params.slug
			}),
			latestArticles: []
		};

		if (!selectedMember) {
			return next(new Error("Team members information is not available."));
		}

		return articleService.getLatestPostsByAuthor(selectedMember.data.title)
			.then(articles => {
				selectedMember.latestArticles = articles.hits.hits;
				return {
					title: 'Meet the team',
					team: teamMembers.map(item => {
						if(item.slug === req.params.slug) {
							return Object.assign({}, item, {isSelected: true});
						}
						return item;
					}),
					selectedMember: selectedMember
				};
		}).then(viewModel => {
			res.render('meet-the-team', {
				title: viewModel.title + ' | FT Alphaville',
				team: viewModel.team,
				selectedMember: viewModel.selectedMember
			});
		});
	}).catch(next);
};
