const path = require('path');
const fs = require('fs');

let articles;

const sortArticles = () => {
	return new Promise((resolve) => {
		const directory = path.join(__dirname, '../../content/markets-live/');
		const marketsLiveArticles = [];

		fs.readdir(directory, (error, files) => {
			if (error) throw error;
			const total = files.length;

			files.forEach((file, index) => {
				fs.readFile(directory + file, { encoding: 'utf-8' }, (error, data) => {
					if (error) throw error;

					const content = JSON.parse(data);
					marketsLiveArticles.push(content);

					articles = marketsLiveArticles.sort((a, b) => {
						return new Date(b.publishedDate) - new Date(a.publishedDate);
					});

					if (index + 1 === total) {
						resolve(articles);
					}
				});
			});
		});
	});
};

const paginateArticles = (options) => {
	return new Promise((resolve) => {
		const total = articles.length;
		const paginatedArticles = articles.slice(options.offset, (options.limit + options.offset));

		resolve({ paginatedArticles, total });
	});
};

module.exports = {
	sortArticles,
	paginateArticles
}
