"use strict";

const router = new (require('express')).Router();
const fetch = require('node-fetch');


const av2AccessMetadata = [{
	path_regex: "/curation.*",
	classification: "conditional_registered"
}, {
	path_regex: "/marketslive/\\d{4}-\\d{2}-\\d{2}.*",
	classification: "conditional_registered"
}, {
	path_regex: "/\\d{4}/\\d{2}/\\d{2}/\\d{1,}/.+",
	classification: "conditional_registered"
}, {
	path_regex: "/uc_longroom.*",
	classification: "conditional_registered"
}, {
	path_regex: "/longroom/.*",
	classification: "conditional_alphaville_longroom"
}, {
	path_regex: "/longroom.*",
	classification: "conditional_registered"
}, {
	path_regex: ".*",
	classification: "unconditional"
}];

let wpAccessMetadata = [];

function fetchFreeArticles () {
	const url = `${process.env.PROD_WP_URL}/__access_metadata`;

	return fetch(url)
		.then(res => res.json())
		.then(json => {
			if (json && json.access_metadata) {
				wpAccessMetadata = [];

				json.access_metadata.forEach((item) => {
					if (item.path_regex && item.path_regex.match(/^(\/[0-9]+\/[0-9]+\/[0-9]+\/[0-9]+\/.*)$/)) {
						wpAccessMetadata.push(item);
					}
				});
			}
		})
		.catch((err) => {
			console.log("Error fetching access metadata", err);
		});
}

fetchFreeArticles();
setInterval(fetchFreeArticles, 60 * 1000);



router.get('/__access_metadata', (req, res) => {
	res.json({
		access_metadata: [].concat(wpAccessMetadata).concat(av2AccessMetadata)
	});
});

module.exports = router;
