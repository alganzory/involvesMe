const express = require('express');
const router = express.Router();

const orderController = require("../controllers/orderController")
const { checkAuthenticated, checkNotAutheticated } = require('../controllers/authController');

router.get('/checkout', checkAuthenticated,orderController.get_Order);
router.post('/makeOrder', checkAuthenticated,orderController.makeOrder);
router.get('/success/:id', checkAuthenticated,orderController.paymentSuccess);
router.get('/cancelPayment', checkAuthenticated,orderController.paymentCancelled);
router.get('/' ,  checkAuthenticated, orderController.getCancelOrder);
router.get('/viewOrdersCreator' ,  checkAuthenticated, orderController.get_Order_Creator);
router.post('/cancel', (checkAuthenticated, orderController.cancelOrder))
  

module.exports=router;
