
/**
 * There file do two things:
 *  1. handle global exception
 *  2. handle application error
 */

import config from '../config';
import logger from '../common/logger';
import { getLog as getRequestLog } from './access_log';

/**
 * release allocated resources (e.g. file descriptors, db connection, handles, etc)
 * @param {Number} code exit with specific code
 */
function cleanupAndExit(code = -1) {
  // To do:
  // 1. cleanup the allocated resources (e.g. file descriptors, db connection, handles, etc)
  process.exit(code);
}

/**
 * uncaughtException
 * @param <Error> err the Error object
 */
process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', err);
  cleanupAndExit();
});

/**
 * unhandledRejection handler
 * @param <Error|any> reason The object with which the promise was rejected.
 * @param <Promise> p the Promise that was rejected.
 */
process.on('unhandledRejection', (reason, p) => {
  logger.error('unhandledRejection', reason, p);
  cleanupAndExit();
});

export default function handleServerError(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  const errObj = { url: req.url, message: err.message };
  if (config.env.isDevelopment) {
    errObj.stack = err.stack;
  }

  const requestLog = getRequestLog(req, res);
  logger.error(requestLog);
  logger.error('UnhandledServerError', err);

  if (status >= 500) {
    res.status(status).format({
      html() {
        res.render('error_pages/500', errObj);
      },
      json() {
        res.json(errObj);
      },
      default() {
        res.type('txt').send(errObj.message);
      },
    });
  } else {
    next(err);
  }
}
