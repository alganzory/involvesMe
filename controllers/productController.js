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

const get_product_json = async (productId) => {
  const product = await ProductService.getProductById(productId);
  return(product);
};

const get_store_products = async (storeId) => {
  const products = await ProductService.getProductsByStoreId(storeId);
  return products;
};

module.exports = {
  get_product,
  get_product_json,
  get_store_products
};
