/**
 * Created by xiaobxia on 2017/12/19.
 */
const BaseORM = require('../baseORM');
module.exports = class UserIntegralORM extends BaseORM {
  constructor(connection) {
    super(connection);
    this.defaultTable = 'user_integral';
  }
};
