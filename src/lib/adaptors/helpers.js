function execHooks(ctx, hooks, done) {
  (function exec(err) {
    if (err) return done(err);
    const curr = hooks.shift();
    if (curr) {
      curr.call(ctx, exec);
    } else {
      done();
    }
  })();
}

export {
  execHooks,
};
