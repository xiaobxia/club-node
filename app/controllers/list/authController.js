const BaseController = require('../baseController');
const md5 = require('md5');

module.exports = class AuthController extends BaseController {
  /**
   * POST
   * account
   * password
   */
  login() {
    return async (ctx) => {
      const query = ctx.request.body;
      const data = {
        account: query.account,
        password: query.password
      };
      this.validate(ctx, {
        account: {type: 'string', required: true},
        password: {type: 'string', required: true}
      }, data);
      let connection = null;
      try {
        connection = await this.mysqlGetConnection();
        //登录
        const authService = this.services.authService(connection);
        //返回用户信息
        let user = await authService.login(data.account, data.password);
        //创建token
        const token = md5(user.id + ctx.request.header['user_agent'] + (new Date().getTime()));
        const deviceId = ctx.cookies.get('device_id');
        //添加登录记录
        const sysLogAuditService = this.services.sysLogAuditService(connection);
        sysLogAuditService.addSysLogAudit({
          'user_id': user.id,
          'log_type': 'login',
          'platform': 'admin',
          'token': token,
          'device_id': deviceId
        });
        //得到用户基本信息
        const userService = this.services.userService(connection);
        let userBaseInfo = await userService.getUserInfo({
          select: ['user_name', 'avatar', 'gender'],
          where: {
            state: 'A',
            'user_id': user.id
          }
        });
        //返回信息
        const userInfo = {
          userUuid: user.uuid,
          active: user.active,
          token: token,
          deviceId: deviceId,
          gender: userBaseInfo.gender,
          userName: userBaseInfo['user_name'],
          avatar: userBaseInfo['avatar']
        };
        this.redisClient.setAsync(token + 'userInfo', JSON.stringify(userInfo));
        this.setSessionUser(ctx.session, {token: token});
        this.wrapResult(ctx, {data: {login: true, ...userInfo}});
        this.mysqlRelease(connection);
      } catch (error) {
        this.mysqlRelease(connection);
        if (error.type) {
          this.wrapError(ctx, error.message);
        } else {
          throw error;
        }
      }
    };
  }

  /**
   * GET
   */
  checkLogin() {
    return async (ctx) => {
      const session = this.getSessionUser(ctx.session);
      if (!session) {
        this.wrapResult(ctx, {
          data: {
            isLogin: false
          }
        });
        return;
      }
      let userInfo = await this.redisClient.getAsync(session.token + 'userInfo');
      userInfo = JSON.parse(userInfo);
      this.wrapResult(ctx, {
        data: {
          isLogin: !!userInfo,
          ...userInfo
        }
      });
    }
  }

  /**
   * GET
   */
  logout() {
    return async (ctx) => {
      const errorMessage = this.localConst.errorMessage;
      const session = this.getSessionUser(ctx.session);
      if (!session) {
        this.wrapResult(ctx, {
          data: {
            success: false,
            msg: errorMessage.USER_NOT_LOGIN
          }
        });
        return;
      }
      const token = session.token;
      this.redisClient.delAsync(token + 'userInfo');
      ctx.session = null;
      this.wrapResult(ctx);
    }
  }

  /**
   * GET
   */
  getDeviceId() {
    return async (ctx) => {
      if (!ctx.cookies.get('device_id')) {
        ctx.cookies.set('device_id', md5(ctx.ip + ctx.request.header['user_agent']), {
          expires: new Date('2038-01-18T00:00:03.424Z')
        })
      }
      this.wrapResult(ctx);
    }
  }
};
