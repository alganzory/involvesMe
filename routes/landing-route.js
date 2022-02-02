const express = require('express');
const router = express.Router();

const { checkAuthenticated, checkNotAutheticated } = require('../controllers/authController');
const {get_landing_page} = require('../controllers/landingController');
router.get('/', checkAuthenticated , get_landing_page);
module.exports = router;