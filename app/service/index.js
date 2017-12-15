/**
 * Created by xiaobxia on 2017/10/31.
 */
const AuthService = require('./list/authService');
const UserService = require('./list/userService');
const BroadcastService = require('./list/broadcastService');
const ArticleService = require('./list/articleService');

module.exports = {
  authService(connection){
    return new AuthService(connection);
  },
  userService(connection) {
    return new UserService(connection);
  },
  broadcastService(connection) {
    return new BroadcastService(connection);
  },
  articleService(connection) {
    return new ArticleService(connection);
  }
};
