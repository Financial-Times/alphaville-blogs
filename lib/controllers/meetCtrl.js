'use strict';

const teamService = require('../services/teamService');
const _ = require('lodash');
const cacheHeaders = require('../utils/cacheHeaders');
const imageHelper = require('../../views/helpers/image');


exports.index = (req, res, next) => {
	return teamService.getMembers().then(teamMembers => {
		cacheHeaders.setCache(res, 30);

		res.render('meet-the-team', {
			title: 'Meet the Alphaville Team | FT Alphaville',
			team: teamMembers,
			navSelected: 'Meet the Team',
			helpers: {
				image: imageHelper
			}
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
