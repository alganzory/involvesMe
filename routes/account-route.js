const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');

const accountController = require('../controllers/accountController');

const {checkAuthenticated} = require('../controllers/authController');

router.get("/", checkAuthenticated, accountController.get_myaccount);
router.post("/username", checkAuthenticated,accountController.change_username);

module.exports = router;