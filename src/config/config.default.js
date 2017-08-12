const config = {
  database: {
    mongodb: {
      server: '',
      db: '',
    },
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
  cors: {
    whitelist: [
      'localhost',
    ],
  },
  cookieSecret: '598ed68b7783710f0ee6c35f',
};

export default config;
