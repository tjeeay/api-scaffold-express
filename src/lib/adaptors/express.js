import assert from 'assert';
import makeDebug from 'debug';
import { trimStart, endsWith } from 'lodash';
import { PREFIX, ACTIONS } from '../constants';
import { execHooks } from './helpers';

const debug = makeDebug('adaptors:express');

export default class ExpressAdaptor {
  constructor(app) {
    this.app = app;
  }

  /**
   * apply routes
   * @param {String} version the api version
   * @param {Array} files Array of controller full path
   */
  applyRoutes(version, files) {
    const app = this.app;
    const slash = '/';

    files.forEach((file) => {
      const { default: Controller } = require(file);
      let prefix = Controller[PREFIX] || '/';
      const actions = Controller[ACTIONS] || [];
      const ctrl = new Controller();

      actions.forEach((action) => {
        var { name, method, path, hooks, invoke: invokeAction } = action;

        method = method.toLowerCase();
        assert(method in app, `Unkonwn http method '${method}'.`);

        prefix = trimStart(prefix, '/');
        prefix = `${version}/${prefix}`;

        if (!endsWith(prefix, slash)) {
          prefix += slash;
        }

        path = trimStart(path, '/');
        path = prefix + path;

        app[method](path, (req, res, next) => {
          const ctx = {
            req,
            res,
          };

          execHooks(ctx, hooks.before, (err) => {
            if (err) return next(err);
            invokeAction.call(ctrl, ctx, (err, data) => {
              if (err) return next(err);

              // organize result data and response

              execHooks(ctx, hooks.after, (err) => {
                if (err) debug(`execute after hook of ${Controller.name}.${name} error.`);
              });
            });
          });
        });
        debug(`mount api route: ${method} ${path}`);
      });
    });
  }
};
