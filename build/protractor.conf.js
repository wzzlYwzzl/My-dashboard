/**
 * @fileoverview Configuration file for Protractor test runner.
 *
 * TODO(bryk): Start using ES6 modules in this file when supported.
 */
/* eslint strict: [0] */
'use strict';
require('babel-core/register');
const conf = require('./conf').default;
const path = require('path');

/**
 * Schema can be found here: https://github.com/angular/protractor/blob/master/docs/referenceConf.js
 * @return {!Object}
 */
function createConfig() {
  const config = {
    baseUrl: `http://localhost:${conf.frontend.serverPort}`,

    framework: 'jasmine',

    specs: [path.join(conf.paths.integrationTest, '**/*.js')],
  };

  if (conf.test.useSauceLabs) {
    let name = `Integration tests ${process.env.TRAVIS_REPO_SLUG}, build ` +
        `${process.env.TRAVIS_BUILD_NUMBER}`;
    if (process.env.TRAVIS_PULL_REQUEST !== 'false') {
      name += `, PR: https://github.com/${process.env.TRAVIS_REPO_SLUG}/pull/` +
          `${process.env.TRAVIS_PULL_REQUEST}`;
    }

    config.sauceUser = process.env.SAUCE_USERNAME;
    config.sauceKey = process.env.SAUCE_ACCESS_KEY;
    config.multiCapabilities = [
      {
        'browserName': 'chrome',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'name': name,
      },
      {
        'browserName': 'firefox',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'name': name,
      },
      {
        'browserName': 'internet explorer',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'name': name,
      },
    ];

    // Limit concurrency to not exhaust saucelabs resources for the CI user.
    config.maxSessions = 1;

  } else {
    config.capabilities = {'browserName': 'chrome'};
  }

  return config;
}

/**
 * Exported protractor config required by the framework.
 */
exports.config = createConfig();
