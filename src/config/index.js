import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import config from './config';

const PORT = process.env.PORT;
config.server.port = config.server.port || PORT;

const NODE_ENV = process.env.NODE_ENV || 'development';
const envConfig = require(`./environments/${NODE_ENV}`);

Object.assign(config, envConfig, {
  env: {
    current: NODE_ENV,
    isDevelopment() {
      return NODE_ENV === 'development';
    },
    isStaging() {
      return NODE_ENV === 'staging';
    },
    isProduction() {
      return NODE_ENV === 'production';
    },
  },
});

// ensure log directory exists
config.logDirectory = config.logDirectory || join(__dirname, '../../logs');
existsSync(config.logDirectory) || mkdirSync(config.logDirectory);

export default config;
