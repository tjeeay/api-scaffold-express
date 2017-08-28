import app from './app';
import config from './config';
import logger from './common/logger';

const port = config.server.port || 8008;
global.server = app.listen(port, () => {
  logger.info(`server are listening on port: ${port}`);
});
