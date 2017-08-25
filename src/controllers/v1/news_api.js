import route from '../../common/decorators/route';
import BaseApi from '../base_api';

@route('news')
class NewsApi extends BaseApi {
  constructor(models, logger) {
    super();
    this.models = models;
    this.logger = logger;
  }

  @route('GET', 'list')
  list(req, res, next) {
    res.send('news list');
  }
}

export default NewsApi;
