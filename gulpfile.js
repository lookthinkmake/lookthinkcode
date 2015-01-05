var gulp = require('gulp'),
    penthouse = require('penthouse'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    header  = require('gulp-header'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch'),
    minifyCSS = require('gulp-minify-css'),
    htmlreplace = require('gulp-html-replace'),
    neat = require('node-neat').includePaths,
    stylish = require('jshint-stylish'),
    concat = require('gulp-concat'),
    package = require('./package.json');


var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

gulp.task('css', function () {
    return gulp.src('src/scss/style.scss')
    .pipe(sass({
        errLogToConsole: true,
        includePaths: ['css'].concat(neat)
    }))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(minifyCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest('app/assets/css'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('js',function(){
    gulp.src('src/js/plugins/*.js')
        .pipe(concat('plugins.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/assets/js'))
        .pipe(browserSync.reload({stream:true, once: true}));

    gulp.src('src/js/scripts.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish))
        .pipe(header(banner, { package : package }))
        .pipe(gulp.dest('app/assets/js'))
        .pipe(uglify())
        .pipe(header(banner, { package : package }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/assets/js'))
        .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('penthouse', function () {
    penthouse({
        url : 'app/index.html',
        css : 'app/assets/css/style.min.css',
        width : 400,   // viewport width
        height : 240   // viewport height
    }, function(err, criticalCss) {
        gulp.src('app/index.html')
        .pipe(htmlreplace({
            critical: {
                src: criticalCss,
                tpl: '<!-- build:critical --><style>%s</style><!-- endbuild -->'
            }
        }, keepUnused = true))
        .pipe(gulp.dest('app/'));;
    });
});

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "app"
        }
    });
});
gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('default', ['css', 'penthouse', 'js', 'browser-sync'], function () {
    gulp.start('css');
    gulp.start('penthouse');
    gulp.watch("src/scss/*.scss", ['css', 'penthouse']);
    gulp.watch("src/js/*.js", ['js']);
    gulp.watch("app/*.html", ['bs-reload']);
});
