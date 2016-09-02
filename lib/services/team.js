"use strict";

const fetch = require('node-fetch');
const url = 'https://ftalphaville2-wp.ft.com/api/get_recent_posts/?post_type=team_member';

let cachedTeam;
let cachedNames;

function refreshCache() {
	fetch(`${url}&api_key=${process.env['WP_API_KEY']}`)
		.then(res => res.json())
		.then(json => {
			if (json) {
				setTimeout(refreshCache, 600000);

				cachedTeam = json.posts;

				cachedNames = [];
				if (cachedTeam) {
					cachedTeam.forEach((obj) => {
						cachedNames.push({
							name: obj.title,
							slug: obj.slug
						});
					});
				}
			} else {
				setTimeout(refreshCache, 60000);
			}
		})
		.catch((e) => {
			console.log("Error fetching the team members", e);

			setTimeout(refreshCache, 60000);
		});
}
refreshCache();

exports.getTeamMembers = function () {
	return cachedTeam;
};

exports.getTeamMemberNames = function () {
	return cachedNames;
};
