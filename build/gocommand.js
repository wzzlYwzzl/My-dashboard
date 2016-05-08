import child from 'child_process';
import lodash from 'lodash';
import q from 'q';
import semver from 'semver';

import conf from './conf';

//Add base directory to the gopath so that local imports work.
const sourceGopath = `${conf.paths.backendTmp}`;
// Add the project's required go tools to the PATH.
const devPath = `${process.env.PATH}:${conf.paths.goTools}/bin`;

/**
 * The environment needed for the execution of any go command.
 */
const env = lodash.merge(process.env, {GOPATH: sourceGopath, PATH: devPath});

/**
 * Minimum required Go version.
 */
const minGoVersion = '1.5.0';

/**
 * Spawns a Go process wrapped with the Godep command after making sure all GO prerequisites are
 * present. Backend source files must be packaged with 'package-backend-source' task before running
 * this command.
 * 
 * @param {!Array<string>} args - Arguments of the go command.
 * @param {function(?Error=)} doneFn - Callback.
 * @param {!Object<string, string>=} [envOverride] optional environment variables overrides map.
 */
export default function spawnGoProcess(args, doneFn, envOverride) {
  checkPrerequisites()
    .then(() => spawnProcess(args, envOverride))
    .then(doneFn)
    .fail((error) => doneFn(error));
}

/**
 * Checks if all prerequisites for a go-command execution are present.
 * @return {Q.Promise} 
 */
function checkPrerequisites() {
  return checkGo().then(checkGoVersion).then(checkGodep);
}

/**
 * Checks if go is on the PATH prior to a go command execution, promises an error othewise.
 * @return {Q.Promise} 
 */
function checkGo() {
  let deferred = q.defer();
  child.exec(
    'which go', 
    {env: env,},
    function(error, stdout, stderror) {
      if (error || stderror || !stdout) {
        deferred.reject(new Error(
          'Go is not on the path. Please pass the PATH variable when you run' +
          'the gulp task with "PATH=$PATH" or install go if you have not yet.'));
        return;
      }
      deferred.resolve();
    });
  return deferred.promise;
}

/**
 * Checks if go version fulfills the minimum version prerequisite, promises
 */