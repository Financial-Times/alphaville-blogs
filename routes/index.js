var express = require('express');
var router = express.Router();

const headerConfig = require('../bower_components/alphaville-header/template_config.json');
const envVars = require('../env');

headerConfig.navItems.map(function (obj) {
	if (obj.name.indexOf('The Blog')>-1) {
		obj.selected = true;
	}
	return obj
});

/* GET home page. */
router.get('/', (req, res) => {
	res.render('index', {
		title: 'Alphaville Index Page',

		assetsBasePath: '/assets/index',
		basePath: '/index',

		isTest: envVars.env === 'test' ? true : false,
		isProd: envVars.env === 'prod' ? true : false,

		headerConfig: headerConfig,
		partials: {
			header: '../bower_components/alphaville-header/main.hjs'
		}
	});
});
router.get('/__access_metadata', (req, res) => {
	res.json([
		{
			path_regex: ".*",
			resolution_method: "remote_headers"
		}
	]);
});
router.get('/__gtg', (req, res) => {
	res.sendStatus(200);
});

module.exports = router;
