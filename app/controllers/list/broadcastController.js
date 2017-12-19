/**
 * Created by xiaobxia on 2017/12/6.
 */
const BaseController = require('../baseController');

module.exports = class BroadcastController extends BaseController {
  /**
   * GET
   */
  list() {
    return async (ctx) => {
      let connection = null;
      try {
        connection = await this.mysqlGetConnection();
        const broadcastService = this.services.broadcastService(connection);
        const broadcastList = await broadcastService.getBroadcasts({state: 'A'});
        this.wrapResult(ctx, {data: {list: broadcastList}});
        this.mysqlRelease(connection);
      } catch (error) {
        this.mysqlRelease(connection);
        if (error.type) {
          this.wrapError(ctx, error.message);
        } else {
          throw error;
        }
      }
    }
  }
};
