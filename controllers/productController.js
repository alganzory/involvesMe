const ProductService = require("../models/product-Model");

const get_product = async (req, res) => {
  const productId = req.params.id;
  const product = await ProductService.getProductById(productId);
  
  console.log(product);

  // extract some user info from req.user object
  const user = {
    id: req.user.id,
    type: req.user.type,
    username: req.user.username,
  };
  

  res.render("viewProduct", { product: product, user: user });
};

const get_product_json = async (req, res) => {
  const productId = req.params.id;
  const product = await ProductService.getProductById(productId);
  res.json(product);
};

const getProduct = async (productId) => {
  const product = await ProductService.getProductById(productId);
  return product;
};

const updateProductStock = async (productObject,productId) => {
  var updatedProduct = await ProductService.updateProduct(productId,productObject);
  return updatedProduct;
}

module.exports = {
  get_product,
  get_product_json,
  getProduct,
  updateProductStock
};
