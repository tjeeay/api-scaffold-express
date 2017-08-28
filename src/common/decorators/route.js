import methods from 'methods';
import { API_ROUTES, ROUTE_PREFIX } from '../constants';

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
    if (arguments.length === 1) {
      target[ROUTE_PREFIX] = prefix;
    } else if (arguments.length === 3) {
      if (args.length === 1) {
        path = prefixOrMethod;
      }
      const Api = target.constructor;
      Api[API_ROUTES] = Api[API_ROUTES] || [];
      const route = {
        method,
        path,
        action: descriptor.value,
      };
      Api[API_ROUTES].push(route);
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
