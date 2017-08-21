import fs from 'fs';
import { EOL } from 'os';
import { join } from 'path';
import { inspect } from 'util';
import moment from 'moment';
import winston, { Logger, transports } from 'winston';
import 'winston-daily-rotate-file';

import config from '../config';
import mailer from './mailer';

const logDirectory = join(__dirname, '../../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logConfig = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'gray',
  },
  dateFormat: 'YYYY-MM-DD HH:mm:ss.SSS ZZ',
};

function getTimestamp(format = logConfig.dateFormat) {
  return moment().format(format);
}
const winstonOptions = {
  default: {
    json: false,
    showLevel: true,
    timestamp: getTimestamp,
  },
};

const defaultFileOptions = Object.assign({}, winstonOptions.default, {
  datePattern: 'yyyy-MM-dd-',
  prepend: true,
  prettyPrint: true,
  maxFiles: 31, // keep latest month logs
  zippedArchive: false,
});

function makeRequestLog(req, res) {
  return [
    `[${req.id}]`,
    req.method,
    req.originalUrl || req.url,
    `HTTP/${req.httpVersionMajor + '.' + req.httpVersionMinor}`,
    res.statusCode || '-',
    '-',
    '-',
    req.headers['referer'] || req.headers['referrer'] || '-',
    req.headers['user-agent'] || '-',
    req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress) || '-',
    '-',
  ].join(' ');
}
function formatLog(opts) {
  const ctx = opts.meta || {};
  const req = ctx.request || ctx.req;
  const res = ctx.response || ctx.res;
  const prefix = `[${opts.timestamp()}] [${opts.level.toUpperCase()}]`;

  let log = '';

  if (ctx.req && ctx.res) {
    log += `${prefix} ${makeRequestLog(req, res)}${EOL}`;
  }

  log += `${opts.message}`;
  if (ctx.message && ctx.stack) {
    log += ctx.stack;
  } else if (Object.keys(ctx).length > 0) {
    log += EOL;
    log += inspect(ctx);
  }
  return log;
}

function getFileOptions(level) {
  const options = {
    name: `daily-rotate-file-${level}`,
    level,
    dirname: logDirectory,
    filename: `${level}.log`,
    formatter: formatLog,
  };
  return Object.assign({}, defaultFileOptions, options);
}

const defaultOptions = {
  multiInstance: true,
  config: logConfig,
  onLogging(transport, level, msg, meta) {
    if (!transport.timestamp || typeof transport.timestamp !== 'function') {
      transport.timestamp = getTimestamp;
    }
    const opts = Object.assign({}, transport, {
      level,
      meta,
      message: msg,
    });
    if (config.logger.mailLevels.indexOf(level) >= 0) {
      let subject = `[${config.env.current}] ${msg}`;
      if (meta && meta.message) {
        subject += ` ${meta.message}`;
      }
      mailer.sendText(config.logger.mailRecipients, subject, formatLog(opts));
    }
  },
};

function createLogger(options) {
  const opts = Object.assign({}, defaultOptions, options);
  const levels = opts.config.levels;
  const colors = opts.config.colors;

  const logger = {};

  winston.addColors(colors);
  const consoleLoggerOptions = Object.assign({}, winstonOptions.default, {
    name: 'console-info',
    colorize: true,
  });
  if (opts.multiInstance) {
    const loggers = winston.loggers;

    loggers.add('default', {
      console: consoleLoggerOptions,
    });

    const console = loggers.get('default');
    console.setLevels(levels);

    const allLevels = Object.keys(levels);
    // console will log all logs of each level
    console.level = allLevels.reduce((max, level) => {
      return (levels[level] > levels[max]) ? level : max;
    }, allLevels[allLevels.length - 1]);

    allLevels.forEach((level) => {
      loggers.add(level, { DailyRotateFile: getFileOptions(level) });

      const current = loggers.get(level);
      current.setLevels(levels);
      current.on('logging', opts.onLogging);

      logger[level] = (...args) => {
        console[level](...args);
        current[level](...args);
      };
    });
  } else {
    const instance = new Logger({
      levels,
      colors,
      transports: [
        new transports.Console(consoleLoggerOptions),
      ],
    });

    Object.keys(levels).forEach((level) => {
      instance.add(transports.DailyRotateFile, getFileOptions(level));
      logger[level] = instance[level];
    });

    instance.on('logging', opts.onLogging);
  }
  return logger;
}

const logger = createLogger();

Object.defineProperty(logger, 'accessLogStream', {
  configurable: false,
  enumerable: false,
  writable: false,
  value: {
    write(message) {
      logger.trace(message);
    },
  },
});

// test all transports
// Object.keys(logConfig.levels).forEach(level => logger[level]('init'));

const dateFormat = logConfig.dateFormat;
export {
  dateFormat,
  logger as default,
};
