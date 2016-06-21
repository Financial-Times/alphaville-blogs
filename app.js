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

const routes = {
	index : require('./routes/index'),
	article : require('./routes/article')
};


app.use('/', routes.index);
app.use('/content', routes.article);
app.use('/search', require('./routes/search'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.errMsg || err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.errMsg || err.message,
		error: {}
	});
});

module.exports = app;
