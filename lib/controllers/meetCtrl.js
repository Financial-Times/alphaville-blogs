'use strict';

const teamService = require('alphaville-team-members');
const _ = require('lodash');

const contact = {
	'matthew-c-klein': {
		email: 'matt.klein@ft.com',
		twitter: '@M_C_Klein'
	},
	'dan-mccrum': {
		email: 'dan.mccrum@ft.com',
		twitter: '@FD'
	},
	'izabella-kaminska': {
		email: 'izabella.kaminska@ft.com',
		twitter: '@izakaminska'
	},
	'joseph-cotterill': {
		email: 'joseph.cotterill@ft.com',
		twitter: '@jsphctrl'
	},
	'bryce-elder': {
		email: 'bryce.elder@ft.com',
		twitter: '@BryceElder'
	},
	'cardiff-garcia': {
		email: 'cardiff.garcia@ft.com',
		twitter: '@CardiffGarcia'
	},
	'paul-murphy': {
		email: 'paul.murphy@ft.com',
		twitter: 'n/a'
	},
	'david-keohane': {
		email: 'david.keohane@ft.com',
		twitter: '@DavidKeo'
	},
	'lisa-pollack': {
		email: 'lisa.pollack@ft.com',
		twitter: '@LSPollack'
	}
};

module.exports = (req, res, next) => {
	return teamService.getMembers().then(teamMembers => {
		return teamMembers.map(teamMember => {
			let displayTitle = teamMember.title;
			if (teamMember.slug === 'paul-murphy') {
				displayTitle = teamMember.title + ', Editor';
			}
			return _.extend({}, teamMember,
				{
					displayTitle
				},
				contact[teamMember.slug]
			);
		});
	}).then(teamMembers => {
		res.render('meet-the-team', {
			title: 'Meet the Alphaville Team | FT Alphaville',
			team: teamMembers
		});
	}).catch(next);
};
