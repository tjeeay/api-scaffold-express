import { join } from 'path';
import glob from 'glob';
import express from 'express';
import { getInstence } from '../adaptors';

const app = express();
const adaptor = getInstence(app, 'express');

['v1', 'v2'].forEach((version) => {
  const dir = join(__dirname, version, 'controllers');
  const paths = glob.sync('*_ctrl.js', { root: dir }).map(file => join(dir, file));
  adaptor.applyRoutes(version, paths);
});
