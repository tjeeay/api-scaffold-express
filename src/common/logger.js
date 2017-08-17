import fs from 'fs';
import { join } from 'path';
import { inspect } from 'util';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { Logger, transports } from 'winston';
import 'winston-daily-rotate-file';

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
};

const dateFormat = 'YYYY-MM-DD HH:mm:ss.SSS ZZ';
const defaultOptions = {
  json: false,
  showLevel: true,
  timestamp(format = dateFormat) {
    return moment().format(format);
  },
};

const defaultFileOptions = Object.assign({}, defaultOptions, {
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
      return `[${opts.timestamp()}] [${opts.level.toUpperCase()}] ${opts.message} ${isEmpty(opts.meta) ? '' : inspect(opts.meta)}`;
    },
  };
  return Object.assign({}, defaultFileOptions, options);
}

const logger = new Logger({
  levels: logConfig.levels,
  colors: logConfig.colors,
  transports: [
    new transports.Console(Object.assign({}, defaultOptions, {
      name: 'console-info',
      colorize: true,
    })),
  ],
});
logger.cli();

logger.add(transports.DailyRotateFile, getFileOptions('debug'));
logger.add(transports.DailyRotateFile, getFileOptions('info'));
logger.add(transports.DailyRotateFile, getFileOptions('warn'));
logger.add(transports.DailyRotateFile, getFileOptions('error'));

// test all transports
// Object.keys(logConfig.levels).forEach(level => logger[level]('init'));

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

// logger.on('logging', (transport, level, msg, meta) => {
//   // To do:
//   // if error, send email to admin
//   console.log(transport.name, level, msg, meta);
// });

export {
  dateFormat,
};
export default logger;
