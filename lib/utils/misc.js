'use strict';

const sanitizePath = (path) => {
	path = path.replace(/^\/+|\/+$/g, '')
	path = path.replace(/\/+/, '/');
	return path;
};

module.exports = {
	sanitizePath
};
