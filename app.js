'use strict';

const alphavilleExpress = require('alphaville-express');
const fingerprint = require('./build_config/js/fingerprint');
const _ = require('lodash');
const ftwebservice = require('express-ftwebservice');
const path = require('path');
const cacheHeaders = require('./lib/utils/cacheHeaders');

const env = process.env.ENVIRONMENT === 'prod' ? 'prod' : 'test';

const app = alphavilleExpress({
	directory: __dirname,
	appBasePath: 'index',
	navSelected: 'Home',
	fingerprint: fingerprint,
	env: env
});

ftwebservice(app, {
	manifestPath: path.join(__dirname, 'package.json'),
	about: {
		"schemaVersion": 1,
		"name": "ftalphaville",
		"purpose": "Frontend rendering application for FT Alphaville articles and Markets Live.",
		"audience": "public",
		"primaryUrl": "https://ftalphaville.ft.com",
		"serviceTier": "bronze"
	},
	goodToGoTest: function() {
		return true;
	}
});


app.use(function (req, res, next ) {
	const _render = res.render;
	res.render = function( view, options, fn ) {
		options = options || {};

		_.merge(options, {
			appUrl: process.env.APP_URL
		});

		_render.call(this, view, options, fn);
	};
	next();
});

app.use('/', require('./routes/__access_metadata'));
app.use('/', require('./router'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	if (!res.get('Cache-Control')) {
		cacheHeaders.setCache(res, 60);
	}

	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers
const errorHandler = (err, req, res, next) => {
	const isNotProdEnv = app.get('env') === 'development' ||
		process.env.ENVIRONMENT !== 'prod';

	if (err.status === 404) {
		res.status(404);
		res.render('error_404');
	} else {
		cacheHeaders.setNoCache(res);

		console.log('ERROR =>', err);
		res.status(err.status || 503);
		res.render('error', {
			message: err.errMsg || err.message,
			error: isNotProdEnv ? err : {}
		});
	}
};

app.use(errorHandler);

module.exports = app;
