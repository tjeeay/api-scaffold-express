import assert from 'assert';
import EventEmmiter from 'events';

export default class Controller extends EventEmmiter {
  actions = [];
  hooks = {
    before: [],
    after: []
  };

  constructor(...args) {
    if (new.target === Controller) {
      throw new Error('This is an abstract class.');
    }
    super(...args);
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
