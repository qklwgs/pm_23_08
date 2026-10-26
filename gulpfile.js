const {src, dest, watch, series, parallel} = require('gulp');

const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');

function htmlTask(){
    return src('src/app/*.html')
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
        }))
        .pipe(dest('dist'))
}

function scssTask(){
    return src('src/app/scss/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(rename('index.min.css'))
        .pipe(dest('dist/css'));
}

function jsTask(){
    return src('src/app/js/**/*.js')
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('dist/js'))
}

function imgsTask(){
    return src('src/app/imgs/**/*', { encoding: false })
        .pipe(imagemin())
        .pipe(dest('dist/imgs'))
}

function browserSyncTask(cb){
    browserSync.init({
        server: {
            baseDir: 'dist',
            middleware: function (req, res, next) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                next();
            }
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

function copyBootstrapCssTask(){
    return src('node_modules/bootstrap/dist/css/bootstrap.min.css')
        .pipe(dest('dist/css'))
}

function copyBootstrapJsTask(){
    return src('node_modules/bootstrap/dist/js/bootstrap.bundle.min.js')
        .pipe(dest('dist/js'))
}

function copyIconsCssTask(){
    return src('node_modules/bootstrap-icons/font/bootstrap-icons.css')
        .pipe(dest('dist/css'))
}

function copyIconsFontsTask(){
    return src('node_modules/bootstrap-icons/font/fonts/*', { encoding: false })
        .pipe(dest('dist/css/fonts'))
}

exports.html = htmlTask;
exports.scss = scssTask;
exports.js = jsTask;
exports.imgs = imgsTask;
exports.browserSync = browserSyncTask;
exports.watch = watchTask;

exports.copyBootstrapCssTask = copyBootstrapCssTask;
exports.copyBootstrapJsTask = copyBootstrapJsTask;
exports.copyIconsCssTask = copyIconsCssTask;
exports.copyIconsFontsTask = copyIconsFontsTask;

exports.default = series(
    parallel(copyBootstrapCssTask, copyBootstrapJsTask, copyIconsCssTask, copyIconsFontsTask, htmlTask, scssTask, jsTask, imgsTask),
    parallel(browserSyncTask, watchTask)
)