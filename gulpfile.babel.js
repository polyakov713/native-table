import gulp from 'gulp';
import { deleteAsync } from 'del';
import gulpif from 'gulp-if';

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import concatCss from 'gulp-concat-css';
import cleanCss from 'gulp-clean-css';

import gulpUglifyEs from 'gulp-uglify-es';

import rename from 'gulp-rename';
import browserSync from 'browser-sync';

const isProd = process.argv.includes('--production');

const { src, dest, series, parallel, watch } = gulp;

const sass = gulpSass(dartSass);

const uglify = gulpUglifyEs.default;

const browserSyncInstance = browserSync.create();

function clean() {
  return deleteAsync(['dist']);
}

function html() {
  return src('./src/*.html')
    .pipe(dest('./dist/'))
    .pipe(gulpif(!isProd, browserSyncInstance.reload({ stream: true })));
}

async function styles() {
  return src(['./src/styles/**/*scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(isProd, autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
    })))
    .pipe(concatCss('bundle.css'))
    .pipe(cleanCss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./dist/styles'))
    .pipe(gulpif(!isProd, browserSyncInstance.stream()));

}

async function scripts() {
  return src('./src/scripts/*.js')
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./dist/scripts/'))
    .pipe(browserSyncInstance.reload({ stream: true }));
}

function watchAll() {
  watch('./src/styles/**/*.pcss', styles);
  watch('./src/scripts/**/*.js', scripts);
  watch('./src/*.html', html);
}

function liveReload() {
  browserSyncInstance.init({
    server: {
      baseDir: 'dist',
    },
    notify: false,
  });
}

let defaultTask;
if (isProd) {
  defaultTask = series(clean, parallel(styles, scripts, html));
} else {
  defaultTask = series(clean, parallel(styles, scripts, html), parallel(liveReload, watchAll));
}

export default defaultTask;
