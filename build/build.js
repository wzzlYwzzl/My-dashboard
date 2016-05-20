/**
 * @fileoverview Gulp tasks for building the project.
 */
import del from 'del';
import gulp from 'gulp';
import gulpFilter from 'gulp-filter';
import gulpMinifyCss from 'gulp-minify-css';
import gulpHtmlmin from 'gulp-htmlmin';
import gulpUglify from 'gulp-uglify';
import gulpUseref from 'gulp-useref';
import gulpRev from 'gulp-rev';
import gulpRevReplace from 'gulp-rev-replace';
import uglifySaveLicense from 'uglify-save-license';
import path from 'path';

import conf from './conf';
import {multiDest} from './multidest';

/**
 * Builds production package for current architecture and places it in the dist directory.
 */
gulp.task('build', ['backend:prod', 'build-frontend']);

/**
 * Builds production packages for all supported architecures and places them in the dist directory.
 */
gulp.task('build:cross', ['backend:prod:cross', 'build-frontend:cross']);

/**
 * Builds production version of the frontend application for the current architecture.
 */
gulp.task('build-frontend', ['fonts', 'icons', 'assets', 'index:prod', 'clean-dist'], function() {
  return buildFrontend(conf.paths.distPublic);
});

/**
 * Builds production version of the frontend application for all architecures.
 */
gulp.task(
    'build-frontend:cross',
    ['fonts:cross', 'icons:cross', 'assets:cross', 'index:prod', 'clean-dist'],
    function() { return buildFrontend(conf.paths.distPublicCross); });

/**
 * Copies assets to the dist directory for current architecture.
 */
gulp.task('assets', ['clean-dist'], function() { return assets([conf.paths.distPublic]); });

/**
 * Copies assets to the dist directory for all architectures.
 */
gulp.task(
    'assets:cross', ['clean-dist'], function() { return assets(conf.paths.distPublicCross); });

/**
 * Copies icons to the dist directory for current architecture.
 */
gulp.task('icons', ['clean-dist'], function() { return icons(conf.paths.iconsDistPublic); });

/**
 * Copies icons to the dist directory for all architectures.
 */
gulp.task(
    'icons:cross', ['clean-dist'], function() { return icons(conf.paths.iconsDistPublicCross); });

/**
 * Copies fonts to the dist directory for current architecture.
 */
gulp.task('fonts', ['clean-dist'], function() { return fonts(conf.paths.fontsDistPublic); });

/**
 * Copies fonts to the dist directory for all architectures.
 */
gulp.task(
    'fonts:cross', ['clean-dist'], function() { return fonts(conf.paths.fontsDistPublicCross); });

/**
 * Cleans all build artifacts.
 */
gulp.task('clean', ['clean-dist'], function() {
  return del([conf.paths.goWorkspace, conf.paths.tmp, conf.paths.coverage]);
});

/**
 * Cleans all build artifacts in the dist/ folder.
 */
gulp.task('clean-dist', function() { return del([conf.paths.distRoot]); });

/**
 * Builds production version of the frontend application.
 *
 * Following steps are done here:
 *  1. Vendor CSS and JS files are concatenated and minified.
 *  2. index.html is minified.
 *  3. CSS and JS assets are suffixed with version hash.
 *  4. Everything is saved in the dist directory.
 * @param {string|!Array<string>} outputDirs
 * @return {stream}
 */
function buildFrontend(outputDirs) {
  let htmlFilter = gulpFilter('*.html', {restore: true});
  let vendorCssFilter = gulpFilter('**/vendor.css', {restore: true});
  let vendorJsFilter = gulpFilter('**/vendor.js', {restore: true});
  let assetsFilter = gulpFilter(['**/*.js', '**/*.css'], {restore: true});
  let searchPath = [
    // To resolve local paths.
    path.relative(conf.paths.base, conf.paths.prodTmp),
    // To resolve bower_components/... paths.
    path.relative(conf.paths.base, conf.paths.base),
  ];

  return gulp.src(path.join(conf.paths.prodTmp, '*.html'))
      .pipe(gulpUseref({searchPath: searchPath}))
      .pipe(vendorCssFilter)
      .pipe(gulpMinifyCss())
      .pipe(vendorCssFilter.restore)
      .pipe(vendorJsFilter)
      .pipe(gulpUglify({preserveComments: uglifySaveLicense}))
      .pipe(vendorJsFilter.restore)
      .pipe(assetsFilter)
      .pipe(gulpRev())
      .pipe(assetsFilter.restore)
      .pipe(gulpUseref({searchPath: searchPath}))
      .pipe(gulpRevReplace())
      .pipe(htmlFilter)
      .pipe(gulpHtmlmin({
        removeComments: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
      }))
      .pipe(htmlFilter.restore)
      .pipe(multiDest(outputDirs));
}

/**
 * @param {string|!Array<string>} outputDirs
 * @return {stream}
 */
function assets(outputDirs) {
  return gulp.src(path.join(conf.paths.assets, '/**/*'), {base: conf.paths.app})
      .pipe(multiDest(outputDirs));
}

/**
 * @param {string|!Array<string>} outputDirs
 * @return {stream}
 */
function icons(outputDirs) {
  return gulp
      .src(
          path.join(conf.paths.materialIcons, '/**/*.+(woff2|woff|eot|ttf)'),
          {base: conf.paths.materialIcons})
      .pipe(multiDest(outputDirs));
}

/**
 * @param {string|!Array<string>} outputDirs
 * @return {stream}
 */
function fonts(outputDirs) {
  return gulp
      .src(path.join(conf.paths.robotoFonts, '/**/*.+(woff2)'), {base: conf.paths.robotoFonts})
      .pipe(multiDest(outputDirs));
}
