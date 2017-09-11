import methods from 'methods';
import { PREFIX, ACTIONS } from '../constants';
import Action from '../action';

/**
 * route decorator
 * @param {String} prefixOrMethod the action url prefix or http method type
 * @param {String} path the action relative url
 */
function route(prefixOrMethod, path = '/') {
  let [prefix, method] = ['/', 'get'];
  const args = [].slice.call(arguments);

  if (args.length === 1) {
    prefix = prefixOrMethod;
  } else if (args.length === 2) {
    method = prefixOrMethod;
  }

  return function(target, name, descriptor) {
    if (arguments.length === 1) { // class decorator
      target[PREFIX] = prefix;
    } else if (arguments.length === 3) {  // prop or method decorator
      if (args.length === 1) {
        path = prefixOrMethod;
      }
      const Controller = target.constructor;
      Controller[ACTIONS] = Controller[ACTIONS] || [];

      let action = Controller[ACTIONS].find(it => it.name === name);
      if (!action) {
        action = new Action(name, method, path, descriptor.value);
      }
      Controller[ACTIONS].push(action);
    }
  };
}

const allMethods = {};
exports = module.exports = allMethods;

methods.forEach((method) => {
  allMethods[method] = (path) => route(method, path);
});

allMethods.prefix = (prefix) => route(prefix);
allMethods.default = route;
