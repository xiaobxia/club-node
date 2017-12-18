const BaseModel = require('../baseModel');
const ORMs = require('../orm');

module.exports = class BaseService extends BaseModel {
  constructor(connection) {
    super();
    this.connection = connection || null;
    this.ORMs = ORMs;
  }

  getConnection() {
    return this.connection;
  }
};
