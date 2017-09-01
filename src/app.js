import { join } from 'path';
import express from 'express';
import helmet from 'helmet';
import methodOverride from 'method-override';
import { renderFile } from 'ejs';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import RedisStore from 'connect-redis';
import bodyParser from 'body-parser';
import compress from 'compression';

import config from './config';

// custome middlewares
import cors from './middlewares/cors';
import traceLog from './middlewares/trace-log';
import accessLog from './middlewares/access-log';
import handleNotFound from './middlewares/handle-not-found';
import handleServerError from './middlewares/handle-server-error';

import configRoutes from './config/config.route';

const app = express();

app.use(helmet());  // help secure Express apps with various HTTP headers
app.use(cors(config.cors.whitelist));  // enable cors for web app
app.use(methodOverride('_method')); // use HTTP verbs such as PUT or DELETE in places where the client doesn't support it.

const publicPath = join(__dirname, '../public');
app.set('publicPath', publicPath);
app.use(express.static(publicPath));
app.set('views', join(publicPath, 'views'));
app.set('view engine', 'ejs');  // set default extension while res.render(path) without file extension
app.engine('.ejs', renderFile);
app.engine('.html', renderFile);

app.use(cookieParser());
app.use(session({
  resave: false,  // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: new (RedisStore(session))(config.redis),
  secret: config.cookieSecret,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));  // `extended: false` for prevent sql injection
app.use(compress());

// enable log trace (set `id` for each req)
app.use(traceLog());

// enable access log in development,
// in production will use nginx access log instead
if (config.env.isDevelopment()) {
  app.use(accessLog());
}

// api routes
configRoutes(app);

// config error handlers
app.use(handleNotFound());
app.use(handleServerError());

export default app;
