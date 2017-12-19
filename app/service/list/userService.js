/**
 * Created by xiaobxia on 2017/11/1.
 */
const md5 = require('md5');
const moment = require('moment');
const BaseService = require('../baseService');
const Promise = require("bluebird");


module.exports = class UserService extends BaseService {
  constructor(connection) {
    super(connection);
  }

  async getUser(filter) {
    const errorMessage = this.localConst.errorMessage;
    const userORM = this.ORMs.userORM(this.connection);
    const result = await userORM.select({
      where: filter
    });
    this.checkDBResult(result, errorMessage.NO_USER);
    return result[0];
  }

  async getUserBaseInfo(session, userName) {
    let isSelf = false;
    if (session) {
      let userInfo = await this.redisClient.getAsync(session.token + 'userInfo');
      userInfo = JSON.parse(userInfo);
      if (userInfo.userName === userName) {
        isSelf = true;
      }
    }
    const userArchiveORM = this.ORMs.userArchiveORM(this.connection);
    let select = null;
    if (isSelf) {
      select = ['user_name', 'type', 'avatar', 'true_name', 'gender', 'birthday', 'city',
        'website', 'company', 'school', 'job', 'introduce'];
    } else {
      select = ['user_name', 'type', 'avatar', 'gender', 'birthday', 'city',
        'website', 'company', 'school', 'job', 'introduce'];
    }
    const result = await userArchiveORM.select({
      select: select,
      where: {
        state: 'A',
        'user_name': userName
      }
    });
    const errorMessage = this.localConst.errorMessage;
    this.checkDBResult(result, errorMessage.NO_USER);
    let userBaseInfo = result[0];
    userBaseInfo.isSelf = isSelf;
    //记录日志
    // const userIntegralORM = this.ORMs.userIntegralORM(this.connection);
    // const userIntegral = await userIntegralORM.update({
    //   where: {
    //     'user_id':
    //   }
    // });
    return userBaseInfo;
  }

  async getUserInfo(option) {
    const errorMessage = this.localConst.errorMessage;
    const userArchiveORM = this.ORMs.userArchiveORM(this.connection);
    const result = await userArchiveORM.select({
      select: option.select,
      where: option.where
    });
    this.checkDBResult(result, errorMessage.NO_USER);
    return result[0];
  }

  async updateUserIntegral(option) {
    const userIntegralORM = this.ORMs.userIntegralORM(this.connection);
    const result = await userIntegralORM.update({
      data: option.data,
      where: option.where
    });
    return result[0];
  }

  async getUserIntegral(option) {
    const userIntegralORM = this.ORMs.userIntegralORM(this.connection);
    const result = await userIntegralORM.select({
      where: option.where
    });
    return result[0];
  }

  async register(userInfo) {
    const userEmail = userInfo.email;
    const userName = userInfo.userName;
    const errorMessage = this.localConst.errorMessage;
    //验证用户名或邮箱是否被注册
    const userORM = this.ORMs.userORM(this.connection);
    const verify = await Promise.all([
      userORM.getAllUserByUserName(userName),
      userORM.getAllUserByEmail(userEmail)]
    );
    this.checkDBResult(verify[0], null, errorMessage.DUPLICATE_USER_NAME);
    this.checkDBResult(verify[1], null, errorMessage.DUPLICATE_EMAIL);
    //发送邮件，按理说不会有记录，所以直接新增
    const emailVerifyORM = this.ORMs.emailVerifyORM(this.connection);
    const verifyCode = md5(userName + userEmail);
    await this.sendMail(this.localConst.registerVerifyTemplate({
      sender: this.config.email.senderAccount.auth.user,
      address: this.config.project.remoteAddress + '/user/active',
      userEmail: userEmail,
      verifyCode
    }));
    //添加记录
    await emailVerifyORM.addRecord({
      ...userInfo,
      verifyCode,
      verifyStatus: 1
    });
    //新增用户
    await userORM.addUser({
      ...userInfo
    });
    return verifyCode;
  }

  async registerResult(verifyCode) {
    const errorMessage = this.localConst.errorMessage;
    const emailVerifyORM = this.ORMs.emailVerifyORM(this.connection);
    //id容易被猜出
    const emailRecord = await emailVerifyORM.getRecordByVerifyCode(verifyCode);
    this.checkDBResult(emailRecord, errorMessage.NO_EMAIL_RECORD);
    //发送状态异常
    if (emailRecord[0].verifyStatus !== 1) {
      this.throwError(errorMessage.EMAIL_OVERDUE)
    }
    return emailRecord[0].email;
  }

  async registerActive(verifyCode) {
    const errorMessage = this.localConst.errorMessage;
    const emailVerifyORM = this.ORMs.emailVerifyORM(this.connection);
    //id容易被猜出
    const emailRecord = await emailVerifyORM.getRecordByVerifyCode(verifyCode);
    this.checkDBResult(emailRecord, errorMessage.NO_EMAIL_RECORD);
    //发送状态异常
    if (emailRecord[0].verifyStatus !== 1) {
      this.throwError(errorMessage.EMAIL_OVERDUE);
    }
    //邮件过期
    if (moment(emailRecord[0].updateDate).add(1, 'days').isAfter(moment())) {
      this.throwError(errorMessage.EMAIL_OVERDUE);
    }
    //激活用户
    const nowTime = moment().format('YYYY-M-D HH:mm:ss');
    await emailVerifyORM.updateRecordByVerifyCode(verifyCode, {
      verifyStatus: 2,
      updateDate: nowTime
    });
    const userORM = this.ORMs.userORM(this.connection);
    await userORM.updateUserByEmail(emailRecord[0].email, {
      active: 'Y',
      activeDate: nowTime,
      updateDate: nowTime
    });
    return emailRecord[0].email;
  }

  async sendActiveEmail(userInfo) {
    const errorMessage = this.localConst.errorMessage;
    const userORM = this.ORMs.userORM(this.connection);
    //验证用户有效性
    const user = userORM.getUserByUserId(userInfo.userId);
    this.checkDBResult(user, errorMessage.NO_USER);
    if (userInfo.userName !== user[0].userName) {
      this.throwError(errorMessage.NO_USER);
    }
    if (user[0].active === 'Y') {
      this.throwError(errorMessage.ALREADY_ACTIVE);
    }
    //发送新邮件，因为是已注册过，所以会有记录
    const emailVerifyORM = this.ORMs.emailVerifyORM(this.connection);
    const emailRecord = await emailVerifyORM.getRecordByUserName(userInfo.userName);
    if (emailRecord[0].verifyStatus === 2) {
      this.throwError(errorMessage.ALREADY_ACTIVE);
    }
    //验证发送间隔
    if (moment(emailRecord[0].updateDate).add(1, 'minutes').isAfter(moment())) {
      this.throwError(errorMessage.FREQUENTLY_OPERATION);
    } else {
      //发送邮件
      const verifyCode = md5(emailRecord[0].userName + emailRecord[0].email);
      await this.sendMail(this.localConst.registerVerifyTemplate({
        sender: this.config.email.senderAccount.auth.user,
        address: this.config.project.remoteAddress + '/user/active',
        userEmail: emailRecord[0].email,
        verifyCode
      }));
      //更新记录
      await emailVerifyORM.updateRecordByEmail(emailRecord[0].email, {
        ...userInfo,
        verifyCode,
        verifyStatus: 1,
        updateDate: moment().format('YYYY-M-D HH:mm:ss')
      });
      return verifyCode;
    }
  }
};
