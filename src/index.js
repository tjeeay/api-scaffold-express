import makeDebug from 'debug';
import app from './app';
import config from './config';

const debug = makeDebug('api-scaffold-express:index');

const port = config.server.port || 8008;
app.listen(port, () => {
  debug(`server are listening on port: ${port}`);
});
