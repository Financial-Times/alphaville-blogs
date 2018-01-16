function objectToQuery (obj) {
	const res = [];

	Object.keys(obj).forEach(key => {
		res.push(`${key}=${obj[key]}`);
	});

	return res.join('&');
}
module.exports = objectToQuery;
