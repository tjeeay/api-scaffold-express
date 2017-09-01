import morgan from 'morgan';
import config from '../config';
import logger from '../common/logger';
import { makeRequestLog } from '../common/utils';

function formatLine(tokens, req, res) {
  return makeRequestLog(req, res);
}

function accessLog() {
  let format = formatLine;
  let options = { stream: logger.getAccessLogStream() };

  if (config.env.isDevelopment()) {
    format = 'dev';
    options = {}; // default { stream: process.stdout }
  }

  return morgan(format, options);
}

export default accessLog;
