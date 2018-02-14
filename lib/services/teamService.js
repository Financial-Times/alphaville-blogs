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
	},
	'alexandra-scaggs': {
		email: 'alex.scaggs@ft.com',
		twitter: '@alexandrascaggs'
	},
	'kadhim-shubber': {
		email: 'kadhim.shubber@ft.com',
		twitter: '@kadhimshubber'
	},
	'thomas-hale': {
		email: 'thomas.hale@ft.com',
		twitter: '@TomHale_'
	}
};

const getMembers = () => {
	return teamService.getMembers().then(teamMembers => {
		return teamMembers.map(teamMember => {
			let displayTitle = teamMember.title;
			if (teamMember.slug === 'izabella-kaminska') {
				displayTitle = teamMember.title + ', Editor';
			}
			return _.extend({}, teamMember,
				{
					displayTitle,
					headshotUrl: teamMember.headshotUrl
				},
				contact[teamMember.slug]
			);
		});
	})
};

exports.getMembers = getMembers;

exports.getMember = name => {
	console.log('getMember: ', name);
	return getMembers().then(members => {
		return _.filter(members, {title:name})[0];
	})

}


