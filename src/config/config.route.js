import fs from 'fs';
import { join } from 'path';
import { resolve } from 'url';
import { endsWith, trimStart } from 'lodash';
import { API_ROUTES, ROUTE_PREFIX } from '../common/constants';
import logger from '../common/logger';
import models from '../models';

const slash = '/';

function applyRoute(app, version) {
  const dir = join(__dirname, '../controllers', version);
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const { default: Api } = require(join(dir, file));
    let prefix = Api[ROUTE_PREFIX] || '/';
    const routes = Api[API_ROUTES] || [];
    const api = new Api(models, logger);

    routes.forEach(({ method, path, action }) => {
      method = method.toLowerCase();
      if (!app[method]) {
        throw new Error(`Unkonwn http method '${method}'`);
      }

      if (!endsWith(prefix, slash)) {
        prefix += slash;
      }
      prefix = trimStart(prefix, slash);
      path = trimStart(path, slash);
      path = resolve(`/${version}/`, trimStart(prefix + path, slash));
      app[method](path, (req, res, next) => {
        const ctx = {
          req,
          res,
        };
        const cb = (...args) => {
          next(...args);
        };
        action.call(api, ctx, cb);
      });
      logger.debug(`mount api route: ${method} ${path}`);
    });
  });
}

function config(app) {
  ['v1'].forEach(version => applyRoute(app, version));
}

export default config;
