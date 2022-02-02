const express = require('express')
const router = express.Router()

const {checkAuthenticated} = require('../controllers/authController');
const cartController = require('../controllers/cartController');

router.get('/',checkAuthenticated,cartController.get_Cart);
router.post('/delete', (checkAuthenticated, cartController.deleteProductFromCart));
router.post('/edit', (checkAuthenticated, cartController.editProductFromCart));
router.post('/additem',checkAuthenticated,cartController.addToCart)


module.exports=router;