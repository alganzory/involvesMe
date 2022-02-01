let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const productSchema = new Schema({
  userId: {
    type: String,
    default: null,
    required: true,
  },
  id: String,
  storeId: String,
  storeName: String,
  name: String,
  description: String,
  size: String,
  color: String,
  price: Number,
  category: String,
  stock: Number,
  sold: Number,
  productPhotos: { type : Array , "default" : [] },
  tags: { type : Array , "default" : [] },
}, { timestamps: true });

const Product = mongoose.model("product", productSchema, "product");

exports.productModel = Product;

exports.addProduct = async (product) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const newProduct = new Product(product);
    await newProduct.save();
    return newProduct;
  } catch (error) {
    console.error(error);
  }
};

exports.getProductByuserId = async (userId) => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      var Products = await Product.find({ userId });
      return Products;
    } catch (error) {
      console.error(error);
    }
};

exports.getProductById = async (id) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await Product.findOne({ id });
  } catch (error) {
    console.error(error);
  }
};

exports.getProductsByStoreId = async (storeId) => {
  try {
    console.log(storeId);
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find({ storeId });
    console.log (products);
    return products;
  } catch (error) {
    console.error(error);
  }
};


exports.updateProduct = async (id, product) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedProduct = await Product.updateOne({ id }, product);
    return updatedProduct;
  } catch (error) {
    throw error;
  }
};

exports.deleteProduct = async (id) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedProduct = await Product.deleteOne({ id });
    return updatedProduct;
  } catch (error) {
    throw error;
  }
};