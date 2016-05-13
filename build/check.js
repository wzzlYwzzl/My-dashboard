/**
 * @fileoverview Gulp tasks for checking and validating the code or a commit.
 */
import gulp from 'gulp';
import gulpClangFormat from 'gulp-clang-format';
import gulpEslint from 'gulp-eslint';
import gulpSassLint from 'gulp-sass-lint';
import path from 'path';

import conf from './conf';






/**
 * Lints all projects Javascript files using ESLint. This includes frontend source code, as well as,
 * build scripts.
 */
gulp.task('lint-javascript', function() {
  return gulp
    .src([path.join(conf.paths.src, '**/*.js'), path.join(conf.paths.build, '**/*.js')])
    // Attach lint output to the eslint property of the file.
    .pipe(gulpEslint())
    // Output the lint results to the console.
    .pipe(gulpEslint.format())
    // Exit with an error code (1) on a lint error.
    .pipe(gulpEslint.failOnError());
});

/**
 * Lints all SASS files in the project.
 */
gulp.task('lint-styles', function() {
  return gulp.src(path.join(conf.paths.src, '**/*.js'))
      .pipe(gulpSassLint())
      .pipe(gulpSassLint.format())
      .pipe(gulpSassLint.failOnError());
});

/**
 * Checks whether project's JavaScript files are formatted according to clang-format style.
 */
gulp.task('check-javascript-format', function() {
  return gulp.src([path.join(conf.paths.src, '**/*.js'), path.join(conf.paths.build, '**/*.js')])
      .pipe(gulpClangFormat.checkFormat('file', undefined, {verbose: true, fail: true}));
});