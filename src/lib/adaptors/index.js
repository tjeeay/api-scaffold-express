import assert from 'assert';

const types = ['express', 'koa'];

const getInstance = function(app, type) {
  assert(typeof type === 'string', 'provide adaptor must be a valid string.');

  type = type.toLowerCase();
  assert(types.indexOf(type) > -1, `unknow adaptor type: ${type}.`);

  return new (require(`./${type}`))(app);
};

export {
  getInstance,
};
