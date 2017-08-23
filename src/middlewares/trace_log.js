import { v4 as uuidv4 } from 'uuid';

function trace() {
  return function(req, res, next) {
    req.id = uuidv4();
    next();
  };
}

export default trace;
