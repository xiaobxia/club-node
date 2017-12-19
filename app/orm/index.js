/**
 * Created by xiaobxia on 2017/11/1.
 */
const LogAuditORM = require('./list/logAuditORM');
const EmailVerifyORM = require('./list/emailVerifyORM');
const BroadcastORM = require('./list/broadcastORM');
const SystemMessageORM = require('./list/systemMessageORM');
const ArticleORM = require('./list/articleORM');
const ArticleInfoORM = require('./list/articleInfoORM');
const SysUserORM = require('./list/sysUserORM');
const SysLogAuditORM = require('./list/sysLogAuditORM');
const UserArchiveORM = require('./list/userArchiveORM');
const UserIntegralORM = require('./list/userIntegralORM');

module.exports = {
  logAuditORM(connection) {
    return new LogAuditORM(connection);
  },
  emailVerifyORM(connection) {
    return new EmailVerifyORM(connection);
  },
  broadcastORM(connection) {
    return new BroadcastORM(connection);
  },
  systemMessageORM(connection) {
    return new SystemMessageORM(connection);
  },
  articleORM(connection) {
    return new ArticleORM(connection);
  },
  articleInfoORM(connection) {
    return new ArticleInfoORM(connection);
  },
  sysUserORM(connection) {
    return new SysUserORM(connection);
  },
  sysLogAuditORM(connection) {
    return new SysLogAuditORM(connection);
  },
  userArchiveORM(connection) {
    return new UserArchiveORM(connection);
  },
  userIntegralORM(connection) {
    return new UserIntegralORM(connection);
  }
};
