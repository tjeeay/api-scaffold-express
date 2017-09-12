import assert from 'assert';
import EventEmmiter from 'events';

export default class Controller extends EventEmmiter {
  httpContext;
  actions = [];
  hooks = {
    before: [],
    after: []
  };

  constructor(ctx) {
    if (new.target === Controller) {
      throw new Error('Controller is an abstract class.');
    }
    super();
    this.httpContext = ctx;
  }

  _addHook(type, handler) {
    assert(typeof handler === 'function', 'handler must be a function.');
    assert(['before', 'after'].indexOf(type) > -1, 'handler type only allowe be before or after.');

    this.hooks[type].push(handler);
  }

  addBeforeHook(handler) {
    this._addHook('before', handler);
  }

  addAfterHook(handler) {
    this._addHook('after', handler);
  }
}
