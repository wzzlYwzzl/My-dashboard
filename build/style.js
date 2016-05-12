import gulp from 'gulp';
import gulpAutoprefixer from 'gulp-autoprefixer';
import gulpMinifyCss from 'gulp-minify-css';
import gulpSourcemaps from 'gulp-sourcemaps';
import gulpSass from 'gulp-sass';
import path from 'path';
import gulpConcat from 'gulp-concat';

import {browserSyncInstance} from './serve';
import conf from './conf';


/**
 * Compiles stylesheets and places them into the serve folder. Each stylesheet file is compiled
 * seperately.
 */
gulp.task('styles', function() {
  let sassOptions = {
    style: 'expanded',
  };

  return gulp.src(path.join(conf.paths.frontendSrc, '**/*.scss'))
      .pipe(gulpSourcemaps.init())
      .pipe(gulpSass(sassOptions))
      .pipe(gulpAutoprefixer())
      .pipe(gulpSourcemaps.write('.'))
      .pipe(gulp.dest(conf.paths.serve))
      // If BrowserSync is running, inform it that styles have changed.
      .pipe(browserSyncInstance.stream());
});

/**
 * Compiles stylesheets and places them into the prod tmp folder. Styles are compiled and minified
 * into a single file.
 */
gulp.task('styles:prod', function() {
  let sassOptions = {
    style: 'compressed',
  };

  return gulp.src(path.join(conf.paths.frontendSrc, '**/*.scss'))
      .pipe(gulpSass(sassOptions))
      .pipe(gulpAutoprefixer())
      .pipe(gulpConcat('app.css'))
      .pipe(gulpMinifyCss({
        // Do not process @import statements. This breaks Angular Material font icons.
        processImport: false,
      }))
      .pipe(gulp.dest(conf.paths.prodTmp));
});