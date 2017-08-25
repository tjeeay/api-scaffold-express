import route from '../../common/decorators/route';
import BaseApi from '../base_api';

@route('users')
class UserApi extends BaseApi {
  constructor(models, logger) {
    super();
    this.models = models;
    this.logger = logger;
  }

  @route('POST', 'login')
  login(req, res, next) {
    const user = req.body;
    if (!user.username || !user.password) {
      return res.send({ code: 1, message: '用户名或密码不能为空' });
    }
    if (!(user.username === 'teejay' && user.password === '123456')) {
      return res.send({ code: 1, message: '用户名或密码错误' });
    }

    delete user.password;
    return res.send({ code: 0, message: '登录成功', data: user });
  }

  @route('GET', 'greeting')
  greeting(req, res, next) {
    res.send('Hello world!');
  }
}

export default UserApi;
