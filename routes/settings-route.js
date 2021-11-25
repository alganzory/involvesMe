const express = require('express');
const router = express.Router();
var methodOverride = require('method-override')
const app = express();
//app.use(methodOverride('_method'))

//app.route('/account/username').get(getObjectList).post(postAddObject).put(putObject).delete(deleteObject);

const accountController = require('../controllers/settingsController');

const { checkAuthenticated } = require('../controllers/authController');
router.post("/name", checkAuthenticated, accountController.change_name);
router.post("/bio", checkAuthenticated, accountController.change_bio);
router.get("/", checkAuthenticated, accountController.get_mysettings);
router.post("/username", checkAuthenticated, accountController.change_username);
router.post("/password", checkAuthenticated, accountController.change_password);
router.post("/email", checkAuthenticated, accountController.change_email);
router.post("/type", checkAuthenticated, accountController.change_type);
router.post("/delete-account", checkAuthenticated, accountController.delete_account);


module.exports = router;