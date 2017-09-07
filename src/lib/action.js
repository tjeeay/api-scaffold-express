
export default class Action {
  _name;
  get name() {
    return this._name;
  }

  _path;
  get path() {
    return this._path;
  }

  _handler;
  get handler() {
    return this._handler;
  }

  constructor(name, path, handler) {
    this._name = name;
    this._path = path;
    this._handler = handler;
  }

  invoke(ctx, done) {
    this.handler(ctx, done);
  }
}
