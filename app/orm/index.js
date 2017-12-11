/**
 * Created by xiaobxia on 2017/11/1.
 */
const UserORM = require('./list/userORM');
const LogAuditORM = require('./list/logAuditORM');
const EmailVerifyORM = require('./list/emailVerifyORM');
const BroadcastORM = require('./list/broadcastORM');

module.exports = {
  userORM(connection) {
    return new UserORM(connection);
  },
  logAuditORM(connection) {
    return new LogAuditORM(connection);
  },
  emailVerifyORM(connection) {
    return new EmailVerifyORM(connection);
  },
  broadcastORM(connection) {
    return new BroadcastORM(connection);
  }
};
