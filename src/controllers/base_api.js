import EventEmmiter from 'events';

class BaseApi extends EventEmmiter {
  constructor() {
    super();
    this.beforeListeners = {};
    this.afterListeners = {};
  }

  _addListener(type, name, handler) {
    if (typeof name !== 'string') {
      throw new Error('api name must be a valid string.');
    } else if (typeof handler !== 'function') {
      throw new Error('handler must be a function.');
    }

    if (['before', 'after'].indexOf(type) === -1) {
      throw new Error('handler type must be before or after.');
    }
    const handlers = this.beforeListeners[name] || [];
    handlers.push(handler);
  }

  addBeforeListener(name, handler) {
    this._addListener('before', name, handler);
  }

  addAfterListener(name, handler) {
    this._addListener('after', name, handler);
  }
}

export default BaseApi;
