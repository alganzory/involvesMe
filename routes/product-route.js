const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController');
const {checkAuthenticated} = require('../controllers/authController');

router.get('/',checkAuthenticated,productController.get_addproduct);
router.post('/addProduct',checkAuthenticated, productController.upload_photos, productController.add_product);
router.get('/view/:id', productController.get_product);
router.get('/:id', productController.get_product_json);


module.exports=router;