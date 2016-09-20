const alphavilleExpress = require('alphaville-express');
const fingerprint = require('./build_config/js/fingerprint');
const _ = require('lodash');
const articleService = require('./lib/services/article');

const WpApi = require('alphaville-marketslive-wordpress-api');
WpApi.setBaseUrl(process.env.WP_URL);

const env = process.env.ENVIRONMENT === 'prod' ? 'prod' : 'test';

const app = alphavilleExpress({
	directory: __dirname,
	appBasePath: 'index',
	navSelected: 'Home',
	fingerprint: fingerprint,
	env: env
});

app.set('s3o-cookie-ttl', 86400000); // one day (in ms)


app.use(function (req, res, next ) {
	const _render = res.render;
	res.render = function( view, options, fn ) {
		options = options || {};

		if (options.withMostRecentPost === true) {
			articleService.getRecentPosts().then((mostRecentPost) => {
				const viewModel = _.merge({}, options, {
					mostRecentPost: mostRecentPost.hits.hits[0]._source
				});
				_render.call(this, view, viewModel, fn);
			}).catch((e) => {
				console.log("Error fetching most recent post: ", e);
				_render.call(this, view, options, fn);
			});
		} else {
			_render.call(this, view, options, fn);
		}
	};
	next();
});

app.use('/', require('./routes/__gtg'));
app.use('/', require('./routes/__access_metadata'));
app.use('/', require('./router'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
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
		res.status(err.status || 503);
		res.render('error', {
			message: err.errMsg || err.message,
			error: isNotProdEnv ? err : {}
		});
	}
};

app.use(errorHandler);

module.exports = app;
