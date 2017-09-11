import assert from 'assert';

export default class Action {
  _name;
  get name() {
    return this._name;
  }

  _method;
  get method() {
    return this._method;
  }

  _path;
  get path() {
    return this._path;
  }

  _handler;
  get handler() {
    return this._handler;
  }

  hooks = {
    before: [],
    after: []
  };

  constructor(name, method, path, handler) {
    this._name = name;
    this._method = method;
    this._path = path;
    this._handler = handler;
  }

  _addHook(type, handler) {
    assert(typeof handler === 'function', 'handler must be a function.');
    assert(['before', 'after'].indexOf(type) > -1, 'handler type only allowe be before or after.');

    this.hooks.before(handler);
  }

  addBeforeHook(handler) {
    this._addHook('before', handler);
  }

  addAfterHook(handler) {
    this._addHook('after', handler);
  }

  invoke(ctx, done) {
    this.handler(ctx, done);
  }
}
