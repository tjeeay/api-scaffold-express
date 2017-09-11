import assert from 'assert';
import makeDebug from 'debug';
import { trimStart, endsWith } from 'lodash';
import { PREFIX, ACTIONS } from '../constants';

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
        var { method, path, hooks, invoke: invokeAction } = action;

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

          // To do: exec before and after hook
          const activeHooks = hooks.before;

          function execHook(err) {
            if (err) return next(err);
            const curr = activeHooks.shift();
            if (curr) {
              curr.call(ctx, execHook);
            } else {
              
            }
          }

          const cb = (...args) => {
            next(...args);
          };
          invokeAction.call(ctrl, ctx, cb);
        });
        debug(`mount api route: ${method} ${path}`);
      });
    });
  }
};
