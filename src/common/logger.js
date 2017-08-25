import { EOL } from 'os';
import { inspect } from 'util';
import EventEmitter from 'events';
import moment from 'moment';
import winston, { Logger as WinstonLogger, transports } from 'winston';
import 'winston-daily-rotate-file';

import config from '../config';
import mailer from './mailer';
import { makeRequestLog } from './utils';

const defaultLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};
const defaultColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  trace: 'gray',
};
const dateFormat = 'YYYY-MM-DD HH:mm:ss.SSS ZZ';

function getTimestamp(format = dateFormat) {
  return moment().format(format);
}

const winstonOptions = {
  base: {
    json: false,
    showLevel: true,
    timestamp: getTimestamp,
  },
  get baseFileOptions() {
    return Object.assign({}, winstonOptions.base, {
      datePattern: 'yyyy-MM-dd-',
      prepend: true,
      prettyPrint: true,
      maxFiles: 31, // keep latest month logs
      zippedArchive: false,
    });
  },
  getRotateFileOptions(level) {
    const options = {
      name: `daily-rotate-file-${level}`,
      level,
      dirname: config.logDirectory,
      filename: `${level}.log`,
      formatter: winstonOptions.formatLog,
    };
    return Object.assign({}, winstonOptions.baseFileOptions, options);
  },
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
      mailer.sendText(config.logger.mailRecipients, subject, winstonOptions.formatLog(opts));
    }
  },
  formatLog(opts) {
    const ctx = opts.meta || {};
    const req = ctx.request || ctx.req;
    const res = ctx.response || ctx.res;

    let log = `[${opts.timestamp()}] [${opts.level.toUpperCase()}]`;
    if (ctx.req && ctx.res) {
      log += ` ${makeRequestLog(req, res)}${EOL}`;
    }

    log += ` ${opts.message}`;
    if (ctx.message && ctx.stack) {
      log += ctx.stack;
    } else if (Object.keys(ctx).length > 0) {
      log += EOL;
      log += inspect(ctx);
    }
    return log;
  },
};

function getWinstonInstance(opts) {
  const { levels, colors } = opts;
  const allLevels = Object.keys(levels);

  winston.addColors(colors);
  const consoleLoggerOptions = Object.assign({}, winstonOptions.base, {
    name: 'console-info',
    colorize: true,
  });

  const logger = {};

  if (opts.separateEachLevel) {
    const loggers = winston.loggers;

    loggers.add('default', {
      console: consoleLoggerOptions,
    });

    const console = loggers.get('default');
    console.setLevels(levels);

    // console will log all logs of each level
    console.level = allLevels.reduce((max, level) => {
      return (levels[level] > levels[max]) ? level : max;
    }, allLevels[allLevels.length - 1]);

    allLevels.forEach((level) => {
      loggers.add(level, { DailyRotateFile: winstonOptions.getRotateFileOptions(level) });

      const current = loggers.get(level);
      current.setLevels(levels);
      current.on('logging', opts.onLogging);

      logger[level] = (...args) => {
        console[level](...args);
        current[level](...args);
      };
    });
  } else {
    const instance = new WinstonLogger({
      levels,
      colors,
      transports: [
        new transports.Console(consoleLoggerOptions),
      ],
    });

    allLevels.forEach((level) => {
      instance.add(transports.DailyRotateFile, winstonOptions.getRotateFileOptions(level));
      logger[level] = instance[level];
    });

    instance.on('logging', opts.onLogging);
  }

  return logger;
}

const winstonProviderOptions = {
  separateEachLevel: true,
  getInstance: getWinstonInstance,
  onLogging: winstonOptions.onLogging,
};

class Provider {
  constructor(options) {
    const opts = Object.assign({}, {
      levels: defaultLevels,
      colors: defaultColors,
    }, options);

    this.levels = opts.levels;
    this.colors = opts.colors;
    this.instance = opts.getInstance(opts);
  }

  log(level, ...args) {
    this.instance[level](...args);
  }
}

class Logger extends EventEmitter {
  constructor(provider) {
    super();

    this.provider = provider || new Provider(winstonProviderOptions);

    // expose all log functions
    Object.keys(this.provider.levels).forEach((level) => {
      Object.defineProperty(this, level, {
        value(...args) {
          this.provider.log(level, ...args);
          this.emit('logging', ...[level, this.provider.instance, ...args]);
        },
        configurable: true,
      });
    });
  }

  getAccessLogStream() {
    return {
      write(msg) {
        this.trace(msg);
      }
    };
  }
}

const logger = new Logger();

// test all log functions
// Object.keys(defaultLevels.levels).forEach(level => logger[level]('init'));

export {
  dateFormat,
  logger as default,
};
