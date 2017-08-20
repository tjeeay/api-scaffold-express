import fs from 'fs';
import { join } from 'path';
import { inspect } from 'util';
import moment from 'moment';
import { isEmpty } from 'lodash';
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
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
  },
  dateFormat: 'YYYY-MM-DD HH:mm:ss.SSS ZZ',
};

const winstonOptions = {
  default: {
    json: false,
    showLevel: true,
    timestamp(format = logConfig.dateFormat) {
      return moment().format(format);
    },
  },
};

const defaultFileOptions = Object.assign({}, winstonOptions.default, {
  datePattern: 'yyyy-MM-dd-',
  prepend: true,
  prettyPrint: true,
  maxFiles: 31, // keep latest month logs
  zippedArchive: false,
});

function getFileOptions(level) {
  const options = {
    name: `daily-rotate-file-${level}`,
    level,
    dirname: logDirectory,
    filename: `${level}.log`,
    formatter(opts) {
      let log = `[${opts.timestamp()}] [${opts.level.toUpperCase()}] ${opts.message}`;
      const meta = opts.meta;
      if (!isEmpty(meta)) {
        log += '\n';
        if (meta.message && meta.stack) {
          log += meta.stack;
        } else {
          log += inspect(meta);
        }
      }
      return log;
    },
  };
  return Object.assign({}, defaultFileOptions, options);
}

const defaultOptions = {
  multiInstance: true,
  config: logConfig,
  onLogging(transport, level, msg, meta) {
    // To do:
    // if error, send email to admin
    console.log(transport.name, level, msg, meta);
    if (level === 'error') {
      mailer.sendText(config.mailRecipients.errorLog, msg);
    }
  },
};

function createLogger(options) {
  const opts = Object.assign({}, defaultOptions, options);
  const levels = opts.config.levels;
  const colors = opts.config.colors;

  const logger = {};

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
    console.cli();

    Object.keys(levels).forEach((level) => {
      loggers.add(level, { DailyRotateFile: getFileOptions(level) });

      const current = loggers.get(level);
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

    instance.cli();
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
      logger.info(message);
    },
  },
});

// test all transports
Object.keys(logConfig.levels).forEach(level => logger[level]('init'));

const dateFormat = logConfig.dateFormat;
export {
  dateFormat,
  logger as default,
};
