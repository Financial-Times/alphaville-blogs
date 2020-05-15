const gulp = require('gulp');
const alphavilleBuildTools = require('alphaville-build-tools');

const env = process.env.ENVIRONMENT || 'test';

alphavilleBuildTools(gulp, {
	env: env,
	'build-folder': 'public/build',
	builds: [
		{
			id: 'main',
			standalone: 'mainBundle',
			js: './assets/js/main.js',
			sass: './assets/scss/index-page.scss',
			'build-js': 'main.js',
			'build-css': 'main.css'
		},
		{
			id: 'article',
			standalone: 'articleBundle',
			js: './assets/js/article.js',
			sass: './assets/scss/article-page.scss',
			'build-js': 'article.js',
			'build-css': 'article.css'
		},
		{
			id: 'meetTheTeam',
			standalone: 'meetTheTeam',
			js: './assets/js/meetTheTeam.js',
			sass: './assets/scss/meet-the-team.scss',
			'build-js': 'meetTheTeam.js',
			'build-css': 'meet-the-team.css'
		},
		{
			id: 'ml-index',
			standalone: 'mlIndexBundle',
			js: './assets/js/mlIndex.js',
			sass: './assets/scss/ml-index.scss',
			'build-js': 'mlIndex.js',
			'build-css': 'ml-index.css'
		},
		{
			id: 'curation',
			standalone: 'mlIndexBundle',
			js: './assets/js/curation.js',
			sass: './assets/scss/curation.scss',
			'build-js': 'curation.js',
			'build-css': 'curation.css'
		}
	]
});
