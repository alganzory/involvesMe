const express = require('express')
const router = express.Router()

const {checkAuthenticated} = require('../controllers/authController');
const cartController = require('../controllers/cartController');

router.get('/',checkAuthenticated,cartController.get_Cart);
router.post('/delete', (checkAuthenticated, cartController.deleteProductFromCart));
//For Testing only
//router.post('/additem',checkAuthenticated,cartController.addToCart)

module.exports=router;