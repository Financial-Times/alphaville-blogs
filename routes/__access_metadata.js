const router = require('express').Router();

router.get('/__access_metadata', (req, res) => {
	res.json({
		access_metadata: [{
			path_regex: "/content/(?<uid>[a-f0-9\-]+)",
			classification: "conditional_registered"
		}, {
			path_regex: "/marketslive/(?<uid>[a-f0-9\-]+)",
			classification: "conditional_registered"
		}, {
			path_regex: "/longroom/content/.*",
			classification: "conditional_alphaville_longroom"
		}, {
			path_regex: "/longroom/.*",
			classification: "conditional_registered"
		}, {
			path_regex: ".*",
			classification: "unconditional"
		}]
	});
});

module.exports = router;
