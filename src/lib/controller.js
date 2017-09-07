import assert from 'assert';
import EventEmmiter from 'events';

export default class Api extends EventEmmiter {
  // the http context
  ctx;
  logger;
  // all api methods
  actions = [];
  // exec before invoke method
  beforeHooks = {};
  // exec after method invoked
  afterHooks = {};

  constructor(ctx, logger) {
    if (new.target === Api) {
      throw new Error('This is an abstract class.');
    }
    super();
    this.ctx = ctx;
    this.logger = logger;
  }

  _addHook(type, actionName, handler) {
    assert(typeof actionName === 'string', 'action name must be a valid string.');
    assert(typeof handler === 'function', 'handler must be a function.');
    assert(['before', 'after'].indexOf(type) > -1, 'handler type only allowe be before or after.');

    const handlers = this.beforeHooks[actionName] || [];
    handlers.push(handler);
  }

  addBeforeHook(actionName, handler) {
    this._addHook('before', actionName, handler);
  }

  addAfterHook(actionName, handler) {
    this._addHook('after', actionName, handler);
  }
}
