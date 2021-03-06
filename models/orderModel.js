const { Store } = require("express-session");
let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const orderSchema = new Schema({
  buyerId: String,
  cartId: String,
  products: { type : Array , "default" : [] },
  subTotal : Number,
  totalPrice: Number,
  orderId: String,
  fullName: String,
  phoneNumber: String,
  address: String,
  additionalInfo: String,
  pointsUsed : Number,
  reward: Number,
  promoCode: String,
  isPaid: Boolean,
  orderStatus: String,
  paymentMethod: String,
  paymentId: String,
  saleId: String,
  deliveryDate: Date
}, { timestamps: true });
const Order = mongoose.model("order", orderSchema, "order");
exports.orderModel = Order;

exports.addOrder= async (order) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const newOrder = new Order(order);
    await newOrder.save();
    return newOrder;
  } catch (error) {
    console.error(error);
  }
};

exports.getOrderByuserId = async (userId) => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      var order = await Order.findOne({ userId });
      return order;
    } catch (error) {
      console.error(error);
    }
};

exports.getOrdersByuserId = async (userId) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    var order = await Order.find({buyerId: userId });
    return order;
  } catch (error) {
    console.error(error);
  }
};

exports.getOrderBysellerId = async (sellerId) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    var order = await Order.find();
    return order;
  } catch (error) {
    console.error(error);
  }
};

exports.getOrderById = async (orderId) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await Order.findOne({ orderId });
  } catch (error) {
    console.error(error);
  }
};

exports.updateOrder = async (orderId, order) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedOrder = await Order.updateOne({ orderId }, order);
    return updatedOrder;
  } catch (error) {
    throw error;
  }
};

exports.deleteOrder = async (id) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedOrder = await Order.deleteOne({ id });
    return updatedOrder;
  } catch (error) {
    throw error;
  }
};


//update the Status
exports.updateOrderStatus = async(orderid, newOrderStatus)=>{
    try{

        await  mongoose.connect(process.env.MONGO_URI);
        const updatedOrder = await Order.updateOne(

            {orderId: orderid},
            {$set: {orderStatus: newOrderStatus}}
        )
        return updatedOrder;
    }catch (error) {
    throw error;
  }
}
