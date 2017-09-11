import { prefix, get } from '../../../decorators/route';
import Controller from '../../../controller';

@prefix('news')
class NewsController extends Controller {
  constructor(models, logger) {
    super();
    this.models = models;
    this.logger = logger;
  }

  @get('list')
  list({ res }, done) {
    let a = null;
    let b = a.b;
    console.log(b);
    res.send('news list');
  }
}

export default NewsController;
