const ProductService = require('../models/product-Model');


const get_product = async (req, res) => {
    const productId = req.params.id;
    const product = await ProductService.getProductById(productId);
    console.log(product)
    res.render('product', {product: product});
}

module.exports = {
    get_product
}