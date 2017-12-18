/**
 * Created by xiaobxia on 2017/12/13.
 */
const BaseService = require('../baseService');
const md5 = require('md5');
const uuidv4 = require('uuid/v4');
const moment = require('moment');
const Promise = require("bluebird");

module.exports = class ArticleService extends BaseService {
  constructor(connection) {
    super(connection);
  }

  //需要缓存
  async getArticles(filter, start, offset) {
    filter.state = 'A';
    const articleORM = this.ORMs.articleORM(this.connection);
    const articleInfoORM = this.ORMs.articleInfoORM(this.connection);
    const ids = await articleORM.pageSelectIds({
      where: filter,
      start,
      offset
    });
    const results = await Promise.all([
      articleORM.getAllRecordsByIds(ids, ['id', 'uuid', 'title', 'cover', 'url', 'content']),
      articleInfoORM.getRecordsByArticleIds(ids)
    ]);
    console.log(results);
    // let articleList = results[0];
    // let articleInfoList = results[1];
    // for (let k = 0; articleList.length; k++) {
    //   const articleId = articleList[k].id;
    //   for (let j = 0; articleInfoList.length; j++) {
    //     const targetId = articleInfoList[0]['article_id'];
    //     if (articleId === targetId) {
    //
    //     }
    //   }
    // }
  }

  async getArticleCount(filter) {
    const articleORM = this.ORMs.articleORM(this.connection);
    const result = await articleORM.count({
      where: filter
    });
    return result[0].count;
  }

  async getArticle(filter) {
    const articleORM = this.ORMs.articleORM(this.connection);
    const result = await articleORM.select({
      where: filter
    });
    return result[0];
  }

  async addArticle(data) {
    data.state = 'A';
    const articleORM = this.ORMs.articleORM(this.connection);
    data.uuid = md5(data.title + uuidv4());
    const result = await articleORM.addRecord(data);
    const articleInfoORM = this.ORMs.articleInfoORM(this.connection);
    await articleInfoORM.addRecord({
      'uuid': md5('article_info' + result.insertId),
      'article_id': result.insertId
    });
    return result.insertId;
  }

  async saveArticleById(id, data) {
    const articleORM = this.ORMs.articleORM(this.connection);
    data['update_date'] = moment().format('YYYY-M-D HH:mm:ss');
    const result = await articleORM.updateRecordById(id, data);
    return result;
  }

  async deleteArticleById(id) {
    const articleORM = this.ORMs.articleORM(this.connection);
    const result = await articleORM.deleteRecordById(id);
    return result;
  }
};
