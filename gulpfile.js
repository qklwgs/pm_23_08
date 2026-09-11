const {src, dest, watch, series, parallel} = require('gulp');

const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();

function htmlTask(){
    return src('src/app/*.html')
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
        }))
        .pipe(dest('dist'))
}

function scssTask(){
    return src('src/app/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(dest('dist/css'));
}

function jsTask(){
    return src('src/app/js/**/*.js')
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('dist/js'))
}

function imgsTask(){
    return src('src/app/imgs/**/*')
        .pipe(imagemin())
        .pipe(dest('dist/imgs'))
}

function browserSyncTask(cb){
    browserSync.init({
        server:{
            baseDir: 'dist'
        },
        port: 3000,
        notify: false,
    });
    cb();
}

function browserSyncReloadTask(cb){
    browserSync.reload();
    cb();
}

function watchTask(){
    watch('src/app/**/*.html', series(htmlTask, browserSyncReloadTask));
    watch('src/app/scss/**/*.scss', series(scssTask, browserSyncReloadTask));
    watch('src/app/js/**/*.js', series(jsTask, browserSyncReloadTask));
    watch('src/app/imgs/**/*', series(imgsTask, browserSyncReloadTask));
}

exports.html = htmlTask;
exports.scss = scssTask;
exports.js = jsTask;
exports.imgs = imgsTask;
exports.browserSync = browserSyncTask;
exports.watch = watchTask;

exports.default = series(
    parallel(htmlTask, scssTask, jsTask, imgsTask),
    parallel(browserSyncTask, watchTask)
)