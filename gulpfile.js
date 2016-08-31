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
			buildCss: 'main.css'
		},
		{
			id: 'article',
			standalone: 'articleBundle',
			js: './assets/js/article.js',
			sass: './assets/scss/article-page.scss',
			buildJs: 'article.js',
			buildCss: 'article.css'
		},
		{
			id: 'meetTheTeam',
			standalone: 'meetTheTeam',
			js: './assets/js/meetTheTeam.js',
			sass: './assets/scss/meet-the-team.scss',
			buildJs: 'meetTheTeam.js',
			buildCss: 'meet-the-team.css'
		},
		{
			id: 'ml-live',
			standalone: 'mlLiveBundle',
			js: './assets/js/ml-live.js',
			sass: './assets/scss/ml-live.scss',
			buildJs: 'ml-live.js',
			buildCss: 'ml-live.css'
		},
		{
			id: 'ml-index',
			standalone: 'mlIndexBundle',
			js: './assets/js/ml-index.js',
			sass: './assets/scss/ml-index.scss',
			buildJs: 'ml-index.js',
			buildCss: 'ml-index.css'
		}
	]
});
