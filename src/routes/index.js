import fs from 'fs';
import { join } from 'path';
import { API_ROUTES } from '../common/constants';
import logger from '../common/logger';
import models from '../models';

function applyRoute(app, version) {
  const dir = join(__dirname, '../controllers', version);
  fs.readdir(dir, (err, files) => {
    if (err) {
      return logger.error(`failed to apply route. dir: ${dir}`);
    }
    files.forEach((file) => {
      const ctrl = new (require(file))(models, logger);

      ctrl[API_ROUTES] = ctrl[API_ROUTES] || [];
      ctrl[API_ROUTES].forEach(({ method, path, action }) => {
        app[method](path, action);
      });
    });
  });
}

function setup(app) {
  ['v1'].forEach(version => applyRoute(app, version));
}

export default setup;
