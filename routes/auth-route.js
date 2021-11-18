const express = require("express");
const router = express.Router();
const methodOverride = require('method-override');


const authController = require('../controllers/authController');


router.get("/login", authController.checkNotAuthenticated, authController.get_login);

router.post("/login", authController.checkNotAuthenticated, authController.passportAuth);

router.get("/register", authController.checkNotAuthenticated, authController.get_register);

router.post("/register", authController.checkNotAuthenticated, authController.register_user);

router.get ("/google", authController.passportGoogleAuth);

router.get ("/google/redirect", authController.passportGoogleAuth, authController.google_redirect);
router.post("/logout", authController.checkAuthenticated,  authController.logout_user);

module.exports = router;