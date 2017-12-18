const mysql = require('mysql');
const config = require('../config');
const localConst = require('./const');
const localUtil = require('./util');
const logger = require('./common/logger');
const mailer = require('nodemailer');
const emailConfig = config.email;
const mysqlPool = mysql.createPool(config.mysql);
const redis = require("redis");
const client = redis.createClient(config.redis);
const Promise = require('bluebird');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

module.exports = class BaseModel {
  constructor() {
    this.config = config;
    this.localUtil = localUtil;
    this.logger = logger;
    this.localConst = localConst;
    this.mysqlPool = mysqlPool;
    this.isDebug = config.server.debug;
    this.redisClient = client;
  }

  sendMail(option) {
    //防止timeout
    let transporter = mailer.createTransport(emailConfig.senderAccount);
    return new Promise((resolve, reject) => {
      transporter.sendMail(option, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });
  }

  throwError(errorMsg) {
    let error = new Error(errorMsg);
    error.type = this.localConst.NOT_SYS_ERROR;
    throw error;
  }

  checkDBResult(result, ifNullMsg, ifExistMsg) {
    if (!result.length) {
      if (ifNullMsg) {
        this.throwError(ifNullMsg);
      }
    } else {
      if (ifExistMsg) {
        this.throwError(ifExistMsg);
      }
    }
  }
};
