const express = require("express");
const router = express.Router();
const methodOverride = require('method-override');


const authController = require('../controllers/authController');


router.use(authController.passportInitialize);
router.use (authController.passportSession);
router.use (methodOverride('_method'));

router.get("/login", authController.checkNotAuthenticated, authController.get_login);

router.post("/login",  authController.checkNotAuthenticated,  authController.passportAuth);

router.get("/register",   authController.checkNotAuthenticated, authController.get_register);

router.post("/register",  authController.checkNotAuthenticated, authController.register_user);

router.delete("/logout", authController.logout_user);

module.exports = router;
