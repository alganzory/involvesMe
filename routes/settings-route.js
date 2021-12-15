const express = require('express');
const router = express.Router();
var methodOverride = require('method-override')
const app = express();
//app.use(methodOverride('_method'))

//app.route('/account/username').get(getObjectList).post(postAddObject).put(putObject).delete(deleteObject);

const settingsController = require('../controllers/settingsController');

const { checkAuthenticated } = require('../controllers/authController');
router.post("/name", checkAuthenticated, settingsController.change_name);
router.post("/bio", checkAuthenticated, settingsController.change_bio);
router.post("/profile-photo", checkAuthenticated, settingsController.upload_photo,settingsController.change_profile_photo);
router.get("/", checkAuthenticated, settingsController.get_mysettings);
router.post("/username", checkAuthenticated, settingsController.change_username);
router.post("/password", checkAuthenticated, settingsController.change_password);
router.post("/email", checkAuthenticated, settingsController.change_email);
router.post("/type", checkAuthenticated, settingsController.change_type);
router.post("/delete-account", checkAuthenticated, settingsController.delete_account);


module.exports = router;