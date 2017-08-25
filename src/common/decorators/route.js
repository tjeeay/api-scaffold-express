import { resolve } from 'url';
import { API_ROUTES, ROUTE_PREFIX } from '../common/constants';

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
    const proto = target.prototype;

    if (!proto.hasOwnProperty(API_ROUTES)) {
      Object.defineProperty(target, API_ROUTES, {
        configurable: false,
        writable: true,
        enumerable: true,
        value: [],
      });
    }

    if (!proto.hasOwnProperty(ROUTE_PREFIX)) {
      // must ends with '/'
      if (prefix[prefix.length - 1] !== '/') {
        prefix += '/';
      }

      proto[ROUTE_PREFIX] = prefix;
    }

    if (descriptor && descriptor.value) {
      const route = {
        method,
        path: resolve(proto[ROUTE_PREFIX], path),
        action: descriptor.value,
      };

      proto[API_ROUTES].push(route);
    }
  };
}
