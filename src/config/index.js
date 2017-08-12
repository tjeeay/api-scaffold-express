import config from './config.default';

const NODE_ENV = process.env.NODE_ENV || 'development';
const envConfig = require(`./environments/${NODE_ENV}`);

Object.assign(config, envConfig, {
  env: {
    get isDevelopment() {
      return NODE_ENV === 'development';
    },
    get isStaging() {
      return NODE_ENV === 'staging';
    },
    get isProduction() {
      return NODE_ENV === 'production';
    },
  },
});

export default config;
