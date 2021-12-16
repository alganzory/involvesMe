const express = require('express')
const router = express.Router()

const {checkAuthenticated} = require('../controllers/authController');
const productController = require('../controllers/productController');


router.post('/edit',(checkAuthenticated,productController.edit_product));
router.post('/delete', (checkAuthenticated, productController.delete_product));
    
router.get('/', (req,res) => {
    res.render('manage-product');//manage-product.ejs
});



module.exports=router;


