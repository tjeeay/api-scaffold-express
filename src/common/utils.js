import morgan from 'morgan';

function makeRequestLog(req, res) {
  return [
    `[${req.id}]`,
    morgan.method(req, res),
    morgan.url(req, res),
    `HTTP/${morgan['http-version'](req, res)}`,
    morgan.status(req, res),
    `${morgan['response-time'](req, res)}ms`,
    morgan.res(req, res, 'content-length'),
    morgan.referrer(req, res) || '-',
    morgan['user-agent'](req, res) || '-',
    morgan['remote-addr'](req, res) || '-',
    morgan['remote-user'](req, res) || '-',
  ].join(' ');
}

/**
 * fetch all params from req
 * @param {Object} req the http request
 * @param {Boolean} withinRouteParams include params on route when is true, but sometimes we need't such as sign for authentication
 * @returns {Object} return all params of http req
 */
function fetchRequestParams(req, withinRouteParams = true) {
  const { params, query, body } = req;
  let args = Object.assign({}, query, body);
  if (withinRouteParams) {
    args = Object.assign({}, params, args);
  }
  return args;
}

export {
  makeRequestLog,
  fetchRequestParams,
};
