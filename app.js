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


app.use(function (req, res, next ) {
	const _render = res.render;
	res.render = function( view, options, fn ) {
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

// development error handler
// will print stacktrace
if (app.get('env') === 'development' || process.env.ENVIRONMENT !== 'prod') {
	app.use(function(err, req, res, next) {
		if (err.status === 404) {
			res.sendStatus(404);
		} else {
			res.status(err.status || 503);
			res.render('error', {
				message: err.errMsg || err.message,
				error: err
			});
		}
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	if (err.status === 404) {
		res.sendStatus(404);
	} else {
		res.status(err.status || 503);
		res.render('error', {
			message: err.errMsg || err.message,
			error: {}
		});
	}
});

module.exports = app;
