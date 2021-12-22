const express = require('express');
const router = express.Router();
const orderController = require("../controllers/orderController")
const { checkAuthenticated, checkNotAutheticated } = require('../controllers/authController');

router.get('/', checkAuthenticated,orderController.get_Order);
router.post('/makeOrder', checkAuthenticated,orderController.makeOrder);

module.exports = router;