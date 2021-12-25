const express = require('express')
const router = express.Router()

const { checkAuthenticated, checkNotAutheticated } = require('../controllers/authController');
const orderController= require('../controllers/orderController');
router.get('/' ,  checkAuthenticated, (req, res) => {
    res.render("cancelOrder")
})
router.post('/cancel', (checkAuthenticated, orderController.cancelOrder))
  

module.exports=router;