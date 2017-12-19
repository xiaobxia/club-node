const Router = require('koa-router');
const controllers = require('../controllers');
const config = require('../../config/index');

const projectName = config.project.projectName;
if (!projectName) {
  console.error('projectName is required');
  process.exit();
}
const router = new Router({
  prefix: `/${projectName}`
});
//登录
router.post('/sys/auth/login', controllers.authController.login());
router.get('/sys/auth/checkLogin', controllers.authController.checkLogin());
router.get('/sys/auth/logout', controllers.authController.logout());
router.get('/sys/auth/getDeviceId', controllers.authController.getDeviceId());
//注册
router.get('/sys/user/register/active', controllers.userController.registerActive());
router.get('/sys/user/register/result', controllers.userController.registerResult());
router.post('/sys/user/register', controllers.userController.register());
router.get('/sys/user/sendActiveEmail', controllers.userController.sendActiveEmail());
//广播
router.get('/broadcasts', controllers.broadcastController.list());
//文章
router.get('/articles', controllers.articleController.list());
router.post('/articles/add', controllers.articleController.add());
//用户信息
router.get('/userBaseInfo', controllers.userController.getUserBaseInfo());


module.exports = router;
