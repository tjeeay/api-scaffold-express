import fs from 'fs';
import { join } from 'path';
import { resolve } from 'url';
import { endsWith, trimStart } from 'lodash';
import { API_ROUTES, ROUTE_PREFIX } from '../common/constants';
import logger from '../common/logger';
import models from '../models';

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

      if (!endsWith(prefix, '/')) {
        prefix += '/';
      }
      prefix = trimStart(prefix, '/');
      path = trimStart(path, '/');
      path = resolve(`/${version}/`, trimStart(prefix + path, '/'));
      app[method](path, action.bind(api));
      logger.debug(`mount api route: ${method} ${path}`);
    });
  });
}

function setup(app) {
  ['v1'].forEach(version => applyRoute(app, version));
}

export default setup;
