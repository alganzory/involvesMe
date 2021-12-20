let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: {
    type: String,
    default: null,
  },
  id: String,
  products: { type : Array , "default" : [] },
  totalPrice: Number
}, { timestamps: true });
const Cart = mongoose.model("cart", cartSchema, "cart");

exports.cartModel = Cart;

exports.addCart= async (cart) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const newCart = new Cart(cart);
    await newCart.save();
    return newCart;
  } catch (error) {
    console.error(error);
  }
};

exports.getCartByuserId = async (userId) => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      var cart = await Cart.findOne({ userId });
      return cart;
    } catch (error) {
      console.error(error);
    }
};

exports.getCartById = async (id) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await Cart.findOne({ id });
  } catch (error) {
    console.error(error);
  }
};

exports.updateCart = async (id, cart) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedCart = await Cart.updateOne({ id }, cart);
    return updatedCart;
  } catch (error) {
    throw error;
  }
};

exports.deleteCart = async (id) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedCart = await Cart.deleteOne({ id });
    return updatedCart;
  } catch (error) {
    throw error;
  }
};