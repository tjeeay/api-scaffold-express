const config = {
  server: {
    port: 8008,
  },
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
  smtp: {
    host: 'smtp.163.com',
    port: 465,  // (defaults to 587 is secure is false or 465 if true)
    secure: true,
    auth: {
      user: 'sender@163.com',
      pass: 'passwrod',
    },
  },
  logger: {
    mailLevels: ['error'],
    mailRecipients: 'someone@example.com',
  },
};

export default config;
