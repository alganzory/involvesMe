let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const productSchema = new Schema({
  userId: {
    type: String,
    default: null,
    required: true,
  },
  id: String,
  photos: { type : Array , "default" : [] },
  name: String,
  description: String,
  size: String,
  price: Number,
  category: String,
  tags: { type : Array , "default" : [] },
  stock: Number,
  sold: Number,
  // some of these attributes are probably not needed but hey
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
  // isDeleted: { type: Boolean, default: false },
  // isSold: { type: Boolean, default: false },
  // isActive: { type: Boolean, default: true },
  // isFeatured: { type: Boolean, default: false },
  // isNew: { type: Boolean, default: false },
  // isPopular: { type: Boolean, default: false },
  // isOnSale: { type: Boolean, default: false },
  // isFreeShipping: { type: Boolean, default: false },
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