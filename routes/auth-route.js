const express = require("express");
const router = express.Router();
const methodOverride = require('method-override');


const authController = require('../controllers/authController');


router.get("/login", authController.checkNotAuthenticated, authController.get_login);

router.post("/login", authController.checkNotAuthenticated, authController.passportAuth);

router.get("/register", authController.checkNotAuthenticated, authController.get_register);

router.post("/register", authController.checkNotAuthenticated, authController.register_user);

router.get ("/forgot-password", authController.checkNotAuthenticated, authController.get_forgot_password);
router.get ("/reset-password/:token/:id", authController.checkNotAuthenticated, authController.get_reset_password);

router.post("/reset-password", authController.checkNotAuthenticated, authController.post_reset_password);
router.post("/forgot-password", authController.checkNotAuthenticated, authController.post_forgot_password);

router.get ("/google", authController.passportGoogleAuth);

router.get ("/google/redirect", authController.passportGoogleAuth, authController.google_redirect);

router.get ("/twitch", authController.passportTwitchAuth);

router.get ("/twitch/redirect", authController.passportTwitchAuth, authController.twitch_redirect);

router.post("/logout", authController.checkAuthenticated,  authController.logout_user);
router.get("/logout", authController.checkAuthenticated,  authController.logout_user);

module.exports = router;