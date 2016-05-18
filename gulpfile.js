const gulp = require('gulp');
const alphavilleBuildTools = require('alphaville-build-tools');

const env = process.env.ENVIRONMENT || 'test';

alphavilleBuildTools(gulp, {
	env: env,
	buildFolder: 'public/build',
	builds: [
		{
			id: 'main',
			standalone: 'mainBundle',
			js: './assets/js/main.js',
			sass: './assets/scss/index-page.scss',
			buildJs: 'main.js',
			buildCss: 'index.css'
		},
		{
			id: 'article',
			standalone: 'articleBundle',
			js: './assets/js/article.js',
			sass: './assets/scss/article-page.scss',
			buildJs: 'article.js',
			buildCss: 'article.css'
		}
	]
});
