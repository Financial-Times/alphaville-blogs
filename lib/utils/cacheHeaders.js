exports.setCache = (res, value) => {
	if (process.env.CACHE_ENABLED === 'true') {
		if (value > 0) {
			res.set('Surrogate-Control', 'public, max-age=' + value);
			res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		} else {
			exports.setNoCache(res);
		}
	} else {
		exports.setNoCache(res);
	}
};

exports.setNoCache = (res) => {
	res.set('Surrogate-Control', 'max-age=0');
	res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
};
