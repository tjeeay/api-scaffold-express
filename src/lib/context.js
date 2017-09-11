
export default class Context {
  args;
  req;
  res;
  state = 'INIT';

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }
}
