/**
 * Created by xiaobxia on 2017/12/13.
 */
const BaseORM = require('../baseORM');
module.exports = class ArticleInfoORM extends BaseORM {
  constructor(connection) {
    super(connection);
    this.defaultTable = 'article_info';
  }

  getRecordsByArticleIds(ids) {
    const select = ['article_id','like_count', 'comment_count', 'collect_count'];
    return this.query({
      sql: `SELECT ?? FROM ${this.defaultTable} WHERE article_id IN (?) ORDER BY id DESC`,
      values: [select, ids]
    });
  }
};
