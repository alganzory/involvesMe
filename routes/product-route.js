const express = require('express')
const router = express.Router()

const {checkAuthenticated} = require('../controllers/authController');
const productController = require('../controllers/productController');

router.get('/',checkAuthenticated,productController.get_addproduct);
router.post('/addProduct',checkAuthenticated, productController.upload_photos, productController.add_product);

module.exports=router;