const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
router.get('/:id', productController.get_product);
module.exports=router;