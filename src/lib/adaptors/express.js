import assert from 'assert';
import makeDebug from 'debug';
import { trim, trimStart } from 'lodash';
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

    files.forEach((file) => {
      const { default: Controller } = require(file);
      let prefix = Controller[PREFIX] || '/';
      const ctrlHooks = Controller[ACTIONS] || [];
      const actions = Controller[ACTIONS] || [];

      actions.forEach((action) => {
        var { name, method, path, hooks: actHooks, invoke: invokeAction } = action;

        method = method.toLowerCase();
        assert(method in app, `Unkonwn http method '${method}'.`);

        prefix = trim(prefix, '/');
        prefix = `${version}/${prefix}`;

        path = trimStart(path, '/');
        path = `${prefix}/${path}`;

        app[method](path, (req, res, next) => {
          const ctx = {
            req,
            res,
          };

          // each request has its own ctrl instance
          const ctrl = new Controller(ctx);

          // the controll hooks
          execHooks(ctx, ctrlHooks.before, (err) => {
            if (err) return next(err);
            // the action hooks
            execHooks(ctx, actHooks.before, (err) => {
              if (err) return next(err);
              invokeAction.call(ctrl, ctx, (err, data) => {
                if (err) return next(err);

                // organize result data and response

                execHooks(ctx, actHooks.after, (err) => {
                  if (err) debug(`execute after hook of ${Controller.name}.${name} error.`);

                  execHooks(ctx, ctrlHooks.after, (err) => {
                    if (err) debug(`execute after hook of ${Controller.name}.${name} error.`);
                  });
                });
              });
            });
          });
        });
        debug(`mount api route: ${method} ${path}`);
      });
    });
  }
};
