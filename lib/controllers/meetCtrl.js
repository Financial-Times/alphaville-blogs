'use strict';

const fetch = require('node-fetch');
const articleService = require('../services/article');
const url = 'http://ftalphaville.ft.com/api/get_recent_posts/?post_type=team_member';
const _ = require('lodash');
const paulSlug = 'paul-murphy';

const orderTeam = (team) => {
	team = _.orderBy(team, ['slug']);

	let paul;
	let paulIndex;

	team.forEach((tm, index) => {
		if(tm.slug === paulSlug) {
			paul = tm;
			paulIndex = index;
		}
	});
	return [
		paul,
		...team.slice(0, paulIndex),
		...team.slice(paulIndex+1)
	];
};

module.exports = (req, res, next) => {
	console.log(req.params.slug);
	fetch(`${url}&api_key=${process.env['OLD_WP_API_KEY']}`)
		.then(res => res.json())
		.then(json => {
			const selectedMember = {
				data: _.find(json.posts, {slug: req.params.slug}),
				latestArticles: []
			};
			console.log('selectedMember', selectedMember);
			console.log('posts', json.posts);
			return articleService.getLatestPostsByAuthor(selectedMember.data.title)
				.then(articles => {
					selectedMember.latestArticles = articles.hits.hits;
					return {
						title: 'Meet the team',
						team: orderTeam(json.posts).map(item => {
							if(item.slug === req.params.slug) {
								return Object.assign({}, item, {isSelected: true});
							}
							return item;
						}),
						selectedMember: selectedMember
					};
				});
		})
		.then(viewModel => {
			res.render('meet-the-team', {
				title: viewModel.title + ' | FT Alphaville',
				team: viewModel.team,
				selectedMember: viewModel.selectedMember
			});
		})
		.catch(next);
};
