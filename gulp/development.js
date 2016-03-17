var gulp = require('gulp'),
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  minifyCss = require('gulp-minify-css'),
  rename = require('gulp-rename'),
  connect = require('gulp-connect'),
  ngAnnotate = require('gulp-ng-annotate'),
  gutil = require('gulp-util'),
  uglify = require('gulp-uglify'),
  ngmin = require('gulp-ngmin'),
  stripDebug = require('gulp-strip-debug'),
  rev = require('gulp-rev-append');

var defaultTasks = ['sass', 'watch', 'server'];

gulp.task('development', defaultTasks);

var paths = {
  css: ['./www/css/**/*.css'],
  js: ['./www/js/**/*.js'],
  html: ['./www/index.html', './www/templates/**/*.html'],
  sass: ['./scss/**/*.scss', './scss/**/*.scss']
};

gulp.task('env:development', function () {
  process.env.NODE_ENV = 'development';
});

gulp.task('js', function (done) {
  gulp.src(paths.js)
    .pipe(connect.reload())
    .on('end', done);
});

gulp.task('css', function (done) {
  gulp.src(paths.css)
    .pipe(connect.reload())
    .on('end', done);
});

gulp.task('html', function (done) {
  gulp.src(paths.html)
    .pipe(connect.reload())
    .on('end', done);
});

gulp.task('watch', function () {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['js', 'minifyJs']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.html, ['html']);
});

gulp.task('sass', function (done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('./www/css/'))
    .pipe(connect.reload())
    .on('end', done);
});


gulp.task('server', function () {
  connect.server({
    root: ['www'],
    port: 9000,
    host: '0.0.0.0',
    livereload: true,
    middleware: function (connect, o) {
      return [(function () {
        var url = require('url');
        var proxy = require('proxy-middleware');
        var options = url.parse('http://test.api.mall.jpjie.com/');
        options.route = '/api';
        return proxy(options);
      })()];
    }
  });
});
