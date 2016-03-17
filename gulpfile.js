var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var connect = require('gulp-connect');

var ngAnnotate = require('gulp-ng-annotate'); // gulp ng
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var ngmin = require('gulp-ngmin');
var stripDebug = require('gulp-strip-debug');

gulp.task('minifyJs', function() {
  return gulp.src([
    './www/js/app.js',
    './www/js/controllers.js',
    './www/js/services.js',
    './www/js/controllers/*.js',
    './www/js/directives.js',
    './www/js/services/*.js',
    ]) //注意，此处特意如此，避免顺序导致的问题
    .pipe(ngAnnotate())
    .pipe(ngmin({dynamic: false}))
    //.pipe(stripDebug())
    .pipe(uglify({outSourceMap: false}))
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('./www/dist/js/'))
});

var paths = {
  css: ['./www/css/**/*.css'],
  js: ['./www/js/**/*.js'],
  html: ['./www/index.html', './www/templates/**/*.html'],
  sass: ['./scss/**/*.scss','./scss/**/*.scss']
};
 
gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(connect.reload())
    .on('end', done);
});
 
gulp.task('js', function(done) {
  gulp.src(paths.js)
    .pipe(connect.reload())
    .on('end', done);
});
 
gulp.task('css', function(done) {
  gulp.src(paths.css)
    .pipe(connect.reload())
    .on('end', done);
});
 
gulp.task('html', function(done) {
  gulp.src(paths.html)
    .pipe(connect.reload())
    .on('end', done);
});
 
gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['js','minifyJs']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.html, ['html']);
});
 
gulp.task('default', ['watch','minifyJs', 'server']);
 
gulp.task('server', function(){
  connect.server({
    root: ['www'],
    port: 9000,
    host : '0.0.0.0', 
    livereload: true,
    middleware: function(connect, o) {
      return [ (function() {
          var url = require('url');
          var proxy = require('proxy-middleware');
          var options = url.parse('http://api.test.com/');
          options.route = '/api';
          return proxy(options);
      })() ];
    }
  });
});
