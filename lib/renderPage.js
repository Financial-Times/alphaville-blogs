var environment = process.env.ENVIRONMENT || 'test';

module.exports = function(res, view, path, options){

	var defaultOptions = {
		assetsBasePath: '/assets/' + path,
		basePath: '/' + path,
		isTest: environment === 'test' ? true : false,
		isProd: environment === 'prod' ? true : false,
	};

	var defaultPartials = {
		header: '../bower_components/alphaville-header/main.hjs',
		footer: '../views/partials/footer.hjs'
	}

	Object.assign(options, defaultOptions);
	Object.assign(options.partials, defaultPartials);

	res.render(view, options);

};
