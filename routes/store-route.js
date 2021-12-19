const express = require('express');
const router = express.Router();

const storeController = require('../controllers/storeController');
const { checkAuthenticated, checkNotAutheticated } = require('../controllers/authController');

router.get('/', checkAuthenticated, storeController.get_mystore);
router.get('/user/', checkAuthenticated, storeController.get_store);

router.post ('/edit/', checkAuthenticated, storeController.upload_photo, storeController.edit_mystore);

module.exports = router;