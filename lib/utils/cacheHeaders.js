exports.setCache = (res, value) => {
	if (value > 0) {
		res.set('Cache-Control', 'public, max-age=' + value);
	} else {
		exports.setNoCache(res);
	}
};

exports.setNoCache = (res) => {
	res.set('Cache-Control', 'private, no-cache, no-store');
};
