import browserSync from 'browser-sync';
import browserSyncSpa from 'browser-sync-spa';
import child from 'child_process';
import gulp from 'gulp';
import url from 'url';
import path from 'path';
import proxyMiddleware from 'proxy-middleware';

import conf from './conf';


/**
 * Browser sync instance that serves the application.
 */
export const browserSyncInstance = browserSync.create();

/**
 * Dashboard backend arguments used for development mode.
 * @type {!Array<string>}
 */
const backendDevArgs = [
    `--apiserver-host=${conf.backend.apiSerberHost}`,
    `--port=${conf.backend.devServerPort}`,
    `--heapster-host=${conf.backend.heapsterServerHost}`,
];

/**
 * Dashboard backend arguments used for production mode.
 * @type {!Array<string>}
 */
const backendArgs = [
    `--apiserver-host=${conf.backend.apiServerHost}`,
    `--port=${conf.backend.serverPort}`,
    `--heapster-host=${conf.backend.heapsterServerHost}`,
];

/**
 * Currently running backend process object. Null if the backend is not runnging.
 * @type {?child.ChildProcess}
 */
let runningBackendProcess = null;
