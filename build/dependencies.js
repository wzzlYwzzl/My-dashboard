import gulp from 'gulp';
import gulputil from 'gulp-util';
import ncu from 'npm-check-updates';
import path from 'path';
import through from 'through2';

import conf from './conf';

/**
 * Updates npm dependencies.
 */
gulp.task('update-npm-dependencies', function() {
  return gulp.src([path.join(conf.paths.base, 'package.json')]).pipe(updateDependencies('npm'));
});

/**
 * Checks npm dependencies which need to be updated.
 */
gulp.task('check-npm-dependencies', function() {
  return gulp.src([path.join(conf.paths.base, 'package.json')]).pipe(checkDependencies('npm'));
});

/**
 * Updates bower dependencies.
 */
gulp.task('update-bower-dependencies', function() {
  return gulp.src([path.join(conf.paths.base, 'bower.json')]).pipe(updateDependencies('bower'));
});

/**
 * Checks bower dependencies which need to be updated.
 */
gulp.task('check-bower-dependencies', function() {
  return gulp.src([path.join(conf.paths.base, 'bower.json')]).pipe(checkDependencies('bower'));
});

/**
 * Updates dependencies of given package manager by updating related package/bower json file.
 */
function updateDependencies(packageManager) {
  return through.obj(function(file, codec, cb) {
    let relativePath = path.relative(process.cwd(), file.path);

    ncu.run({
          packageFile: relativePath,
          packageManager: packageManager,
          cli: true,
          upgradeAll: true,
          args: [],
    })
      .then(cb);
  });
}

/**
 * Checks and lists outdated dependencies if there are any.
 *
 * @param {string} packageManager
 * @return {stream}
 */
function checkDependencies(packageManager) {
  return through.obj(function(file, codec, cb) {
    let relativePath = path.relative(process.cwd(), file.path);

    ncu.run({
         packageFile: relativePath,
         packageManager: packageManager,
       })
        .then(function(toUpgrade) {
          let dependenciesStr = Object.keys(toUpgrade)
                                    .map((key) => { return `${key}: ${toUpgrade[key]}\n`; })
                                    .join('');

          if (dependenciesStr.length !== 0) {
            gulputil.log(gulputil.colors.yellow(
                `Dependencies needed to update:\n${dependenciesStr}\n` +
                `Run: 'gulp update-${packageManager}-dependencies', then '${packageManager} install' to update` +
                ' dependencies.\n'));
          }

          cb();
        });
  });
}
