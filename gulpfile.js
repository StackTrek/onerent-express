const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack');
const gutil = require('gulp-util');

const clientWebpack = webpack(require('./webpack.config'));
gulp.task('react', done => {
  clientWebpack.run((err, stats) => {

    if (err) {
      throw new gutil.PluginError('react', err);
    }

    gutil.log('[react]', stats.toString({
      chunks: false,
      colors: true
    }));

    done();
  });
});

gulp.task('sass', () => {
  return gulp.src('public/stylesheets/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('sass:watch', () => {
  gulp.watch('public/stylesheets/**/*.scss', ['sass']);
});

gulp.task('react:watch', () => {
  gulp.watch('public/typescript/**/*.tsx', ['react']);
});

gulp.task('default', ['sass', 'react']);
gulp.task('watch', ['default', 'sass:watch', 'react:watch']);
