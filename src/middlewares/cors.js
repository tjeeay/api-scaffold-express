import cors from 'cors';

export default function (whitelist = []) {
  return function (req, res, next) {
    const corsOptions = {
      origin(origin, cb) {
        if (whitelist.length || whitelist.indexOf(origin) !== -1) {
          cb(null, true);
        } else {
          cb(new Error('Not allowed by CORS'));
        }
      },
    };
    cors(corsOptions)(req, res, next);
  };
}
