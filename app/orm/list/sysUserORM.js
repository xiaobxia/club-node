/**
 * Created by xiaobxia on 2017/12/13.
 */
const BaseORM = require('../baseORM');
module.exports = class ArticleORM extends BaseORM {
  constructor(connection) {
    super(connection);
    this.defaultTable = 'sys_user';
  }

  //查
  getRawRecordsByAccount(account) {
    return this.query({
      sql: `SELECT * FROM ${this.defaultTable} WHERE state='A' AND (email=? OR mobile=?)`,
      values: [account, account, account]
    });
  }

  getAllRawRecordsByAccount(account) {
    return this.query({
      sql: `SELECT * FROM ${this.defaultTable} WHERE (email=? OR mobile=?)`,
      values: [account, account, account]
    });
  }
};
