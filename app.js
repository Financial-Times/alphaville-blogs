const alphavilleExpress = require('alphaville-express');
const fingerprint = require('./build_config/js/fingerprint');

const env = process.env.ENVIRONMENT === 'prod' ? 'prod' : 'test';

const app = alphavilleExpress({
	directory: __dirname,
	appBasePath: 'index',
	headerConfig: require('alphaville-header-config'),
	navSelected: 'The Blog',
	fingerprint: fingerprint,
	env: env
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
