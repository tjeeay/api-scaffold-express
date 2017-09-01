function extend() {
  return function (req, res, next) {
    next();
  };
}

export default extend();
