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

var defaultTasks = ['sass', 'minifyJs', 'rev','proServer'];

gulp.task('production', defaultTasks);

var paths = {
  css: ['./www/css/**/*.css'],
  js: ['./www/js/**/*.js'],
  html: ['./www/index.html', './www/templates/**/*.html'],
  sass: ['./scss/**/*.scss', './scss/**/*.scss']
};

gulp.task('env:production', function () {
  process.env.NODE_ENV = 'production';
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

gulp.task('minifyJs', function () {
  return gulp.src([
    './www/js/modules/angular-sku.min.js',
    './www/js/modules/angular-rating.js',
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
    .pipe(uglify({outSourceMap: true}))
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('./www/dist/js/'))
});

gulp.task('rev', function () {
  gulp.src('./www/index_pro.html')
    .pipe(rev())
    .pipe(rename('index_pro_v2.html'))
    .pipe(gulp.dest('./www'));
});

gulp.task('proServer', function () {
  connect.server({
    root: ['www'],
    port: 9000,
    host: '0.0.0.0',
    livereload: true,
    middleware: function (connect, o) {
      return [(function () {
        var url = require('url');
        var proxy = require('proxy-middleware');
        var options = url.parse('http://api.mall.jpjie.com/');
        options.route = '/api';
        return proxy(options);
      })()];
    }
  });
});
