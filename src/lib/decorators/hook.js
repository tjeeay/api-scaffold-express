
function hook(type) {
  return function(...fns) {
    return function(target, name, descriptor) {

    };
  };
}

['bofore', 'after'].forEach((type) => {
  exports[type] = hook(type);
});
