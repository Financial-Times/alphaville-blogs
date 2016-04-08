const gulp = require('gulp');
const obt = require('origami-build-tools');
const del = require('del');
const runSequence = require('run-sequence');
const run = require('gulp-run');


gulp.task('bower-update', function (callback) {
	run('node_modules/bower/bin/bower update').exec(callback);
});

gulp.task('bower-install', function (callback) {
	run('node_modules/bower/bin/bower install').exec(callback);
});

gulp.task('bower-clean', function (callback) {
	run('node_modules/bower/bin/bower cache clean').exec(callback);
});

gulp.task('clean-build', function (callback) {
	del(['./public/build'], callback);
});

gulp.task('verify', function() {
	return obt.verify(gulp);
});

gulp.task('obt-build-main', function () {
	return obt.build(gulp, {
		buildFolder: 'public/build',
		standalone: 'mainBundle',
		js: './assets/js/main.js',
		sass: './assets/scss/main.scss',
		buildJs: 'main.js',
		buildCss: 'main.css'
	});
});

gulp.task('obt-build-live', function () {
	obt.build(gulp, {
		buildFolder: 'public/build',
		standalone: 'liveBundle',
		js: './assets/js/live.js',
		sass: './assets/scss/live.scss',
		buildJs: 'live.js',
		buildCss: 'live.css'
	});
});

gulp.task('obt-build', ['obt-build-main', 'obt-build-live']);

gulp.task('build', function (callback) {
	runSequence('clean-build', 'obt-build', callback);
});

gulp.task('obt', ['verify', 'build']);
gulp.task('default', function (callback) {
	runSequence('bower_update', 'bower_install', 'obt', callback);
});

gulp.task('watch', function() {
	gulp.watch(['./assets/**'], ['obt-build']);
});
