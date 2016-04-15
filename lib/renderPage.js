
const envVars = require('../env');

module.exports = function(res, view, path, options){

	var defaultOptions = {
		assetsBasePath: '/assets/' + path,
		basePath: '/' + path,
		isTest: envVars.env === 'test' ? true : false,
		isProd: envVars.env === 'prod' ? true : false,
	};

	var defaultPartials = {
		header: '../bower_components/alphaville-header/main.hjs',
		footer: '../views/partials/footer.hjs'
	}

	Object.assign(options, defaultOptions);
	Object.assign(options.partials, defaultPartials);

	res.render(view, options);

};
