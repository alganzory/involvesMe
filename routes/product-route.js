const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
router.get('/view/:id', productController.get_product);
router.get('/:id', productController.get_product_json);

module.exports=router;