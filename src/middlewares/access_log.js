import morgan from 'morgan';
import config from '../config';
import logger from '../common/logger';

function formatLine(tokens, req, res) {
  return [
    `[${req.id}]`,
    tokens.method(req, res),
    tokens.url(req, res),
    `HTTP/${tokens['http-version'](req, res)}`,
    tokens.status(req, res),
    `${tokens['response-time'](req, res)} ms`,
    tokens.res(req, res, 'content-length'),
    tokens.referrer(req, res) || '-',
    tokens['user-agent'](req, res) || '-',
    tokens['remote-addr'](req, res) || '-',
    tokens['remote-user'](req, res) || '-',
  ].join(' ');
}

function makeLog(req, res) {
  return formatLine(morgan, req, res);
}

let format = formatLine;
let options = { stream: logger.accessLogStream };

if (config.env.isDevelopment) {
  format = 'dev';
  options = {}; // default stream: process.stdout
}

const accessLogger = morgan(format, options);

export {
  makeLog,
};
export default accessLogger;
