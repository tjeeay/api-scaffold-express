
export default class Context {
  req;
  res;
  status = 'INIT';

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }
}
