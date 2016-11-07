'use strict';

const teamService = require('alphaville-team-members');
const _ = require('lodash');
const cacheHeaders = require('../utils/cacheHeaders');

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
	},
	'alexandra-scaggs': {
		email: 'alex.scaggs@ft.com',
		twitter: '@alexandrascaggs'
	}
};

exports.index = (req, res, next) => {
	return teamService.getMembers().then(teamMembers => {
		return teamMembers.map(teamMember => {
			let displayTitle = teamMember.title;
			if (teamMember.slug === 'paul-murphy') {
				displayTitle = teamMember.title + ', Editor';
			}
			return _.extend({}, teamMember,
				{
					displayTitle,
					headshot: `http://image.webservices.ft.com/v1/images/raw/fthead:${teamMember.slug}?source=alphaville&width=124`
				},
				contact[teamMember.slug]
			);
		});
	}).then(teamMembers => {
		cacheHeaders.setCache(res, 30);

		res.render('meet-the-team', {
			title: 'Meet the Alphaville Team | FT Alphaville',
			team: teamMembers
		});
	}).catch(next);
};

exports.dedicatedPage = (req, res, next) => {
	teamService.getMembers().then(teamMembers => {
		for (let i = 0; i < teamMembers.length; i++) {
			if (teamMembers[i].slug === req.params.member) {
				cacheHeaders.setCache(res, 300);
				res.redirect('/meet-the-team#' + teamMembers[i].slug, 301);
				return;
			}
		}

		next();
	}).catch(next);
};
