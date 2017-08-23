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

export {
  makeRequestLog,
};
