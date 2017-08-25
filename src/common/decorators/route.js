import { API_ROUTES, ROUTE_PREFIX } from '../constants';

/**
 * route decorator
 * @param {String} prefixOrMethod the action url prefix or http method type
 * @param {String} path the action relative url
 */
export default function (prefixOrMethod, path = '/') {
  let [prefix, method] = ['/', 'GET'];

  if (arguments.length === 1) {
    prefix = prefixOrMethod;
  } else if (arguments.length === 2) {
    method = prefixOrMethod;
  }

  return function(target, name, descriptor) {
    if (arguments.length === 1) {
      target[ROUTE_PREFIX] = prefix;
    } else if (arguments.length === 3) {
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
