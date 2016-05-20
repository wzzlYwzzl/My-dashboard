/**
 * Gulp tasks for processing and compiling frontend JavaScript files.
 */
import gulp from 'gulp';
import gulpAngularTemplatecache from 'gulp-angular-templatecache';
import gulpClosureCompiler from 'gulp-closure-compiler';
import gulpHtmlmin from 'gulp-htmlmin';
import path from 'path';
import webpackStream from 'webpack-stream';

import conf from './conf';

/**
 * Compiles frontend JavaScript files into development bundle located in {conf.paths.serve}
 * directory. This has to be done because currently browsers do not handle ES6 syntax and
 * modules correctly.
 *
 * Only dependencies of root application module are included in the bundle.
 */
gulp.task('scripts', function() {
  let webpackOptions = {
    devtool: 'inline-source-map',
    module: {
      // ES6 modules have to be preprocessed with Babel loader to work in browsers.
      loaders: [{test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader']}],
    },
    output: {filename: 'app-dev.js'},
    resolve: {
      // Set the module resolve root, so that webpack knows how to process non-relative imports.
      // Should be kept in sync with respective Closure Compiler option.
      root: conf.paths.frontendSrc,
    },
    quiet: true,
  };

  return gulp.src(path.join(conf.paths.frontendSrc, 'index_module.js'))
      .pipe(webpackStream(webpackOptions))
      .pipe(gulp.dest(conf.paths.serve));
});

/**
 * Compiles frontend JavaScript files into production bundle located in {conf.paths.prodTmp}
 * directory.
 */
gulp.task('scripts:prod', ['angular-templates'], function() {
  let closureCompilerConfig = {
    fileName: 'app.js',
    // "foo_flag: null" means that a flag is enabled.
    compilerFlags: {
      angular_pass: null,
      entry_point: 'index_module',
      compilation_level: 'ADVANCED_OPTIMIZATIONS',
      export_local_property_definitions: null,
      externs: [
        path.join(conf.paths.nodeModules, 'google-closure-compiler/contrib/externs/angular-1.5.js'),
        path.join(
            conf.paths.nodeModules,
            'google-closure-compiler/contrib/externs/angular-1.5-http-promise_templated.js'),
        path.join(
            conf.paths.nodeModules,
            'google-closure-compiler/contrib/externs/angular-1.5-q_templated.js'),
        path.join(
            conf.paths.nodeModules, 'google-closure-compiler/contrib/externs/angular-material.js'),
        path.join(
            conf.paths.nodeModules, 'google-closure-compiler/contrib/externs/angular_ui_router.js'),
        path.join(
            conf.paths.nodeModules,
            'google-closure-compiler/contrib/externs/angular-1.4-resource.js'),
        path.join(conf.paths.externs, '**/*.js'),
      ],
      generate_exports: null,
      js_module_root: path.relative(conf.paths.base, conf.paths.frontendSrc),
      // Enable all compiler checks by default and make them errors.
      jscomp_error: '*',
      // Disable checks that are not applicable to the project.
      jscomp_off: [
        // Let ESLint handle all lint checks.
        'lintChecks',
        // This checks aren't working with current google-closure-library version. Will be deleted
        // once it's fixed there.
        'unnecessaryCasts',
        'analyzerChecks',
      ],
      language_in: 'ECMASCRIPT6_STRICT',
      language_out: 'ECMASCRIPT3',
      dependency_mode: 'LOOSE',
      use_types_for_optimization: null,
    },
    compilerPath: path.join(conf.paths.nodeModules, 'google-closure-compiler/compiler.jar'),
    // This makes the compiler faster. Requires Java 7+.
    tieredCompilation: true,
  };

  return gulp
      .src([
        // Application source files.
        path.join(conf.paths.frontendSrc, '**/*.js'),
        // Partials generated by other tasks, e.g., Angular templates.
        path.join(conf.paths.partials, '**/*.js'),
        // Include base.js to enable some compiler functions, e.g., @export annotation handling.
        path.join(conf.paths.bowerComponents, 'google-closure-library/closure/goog/base.js'),
      ])
      .pipe(gulpClosureCompiler(closureCompilerConfig))
      .pipe(gulp.dest(conf.paths.prodTmp));
});

/**
 * Compiles Angular HTML template files into one JS file that serves them through $templateCache.
 */
gulp.task('angular-templates', function() {
  return gulp.src(path.join(conf.paths.frontendSrc, '**/!(index).html'))
      .pipe(gulpHtmlmin({
        removeComments: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
      }))
      .pipe(gulpAngularTemplatecache('angular-templates.js', {
        module: conf.frontend.rootModuleName,
      }))
      .pipe(gulp.dest(conf.paths.partials));
});