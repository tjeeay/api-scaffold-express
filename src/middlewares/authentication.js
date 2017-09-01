import config from '../config';
import { md5 } from '../common/encryption';
import { fetchRequestParams } from '../common/utils';

function generateRawString(params, token = 'api-scaffold-express-sign-token') {
  const sortedKeys = Object.keys(params).sort((a, b) => (a < b) ? -1 : 1);
  return sortedKeys.reduce((a, b) => a + b, '') + token;
}

function authenticate() {
  return function (req, res, next) {
    const params = fetchRequestParams(req, false);

    delete params.Sign;
    delete params.sign;

    const serverRawString = generateRawString(params);
    const serverSignature = md5(serverRawString);
    const clientSignature = req.get('sign') || params.Sign || params.sign;

    if (clientSignature !== serverSignature) {
      const err = new Error('Access Denied');
      err.status = 403;
      if (config.env.isDevelopment()) {
        err.meta = {
          clientSignature,
          serverSignature,
          serverRawString,
        };
      }
      return next(err);
    }
    next();
  };
}

export default authenticate;
