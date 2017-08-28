import { prefix, get } from '../../common/decorators/route';
import BaseApi from '../base_api';

@prefix('news')
class NewsApi extends BaseApi {
  constructor(models, logger) {
    super();
    this.models = models;
    this.logger = logger;
  }

  @get('list')
  list(req, res, next) {
    let a = null;
    let b = a.b;
    console.log(b);
    res.send('news list');
  }
}

export default NewsApi;
