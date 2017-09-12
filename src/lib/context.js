
export default class Context {
  req;
  res;
  state = 'INIT';

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }
}
