import gulp from 'gulp';
import through from 'through2';

/**
 * Utility function for specifying multiple gulp.dest destinations.
 * @param {string|!Array<string>} outputDirs destinations for the gulp dest function calls
 * @return {stream}
 */
export function multiDest(outputDirs) {
  if (!Array.isArray(outputDirs)) {
    outputDirs = [outputDirs];
  }
  let outputs = outputDirs.map((dir) => gulp.dest(dir));
  let outputStream = through.obj();

  outputStream.on('data', (data) => outputs.forEach((dest) => { dest.write(data); }));
  outputStream.on('end', () => outputs.forEach((dest) => { dest.end(); }));

  return outputStream;
}
