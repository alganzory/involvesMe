const orderService = require("../models/order-model");
const cartController = require("../controllers/cartController")
const productController = require("../controllers/productController")
const uuid = require("uuid");

const get_Order = async (req, res) => {
    var order = await cartController.getCartById(req.user.id);
    if(order){
        res.render('order',{order: order, title: "Your Order"});
    }
    else{
        req.flash("error", "Cart Doesnt Have any Items !!");
        res.redirect("/cart/");
    }
};

const makeOrder = async (req, res) => {
    var cart = await cartController.getCartById(req.user.id);
    const {fullName, address, paymentMethod, phoneNumber, additionalInfo, reward , promoCode } = req.body;
    var today = new Date();
    var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+7);
    var order = {
        userId : cart.userId,
        cartId : cart.id,
        products : cart.products,
        totalPrice : cart.totalPrice,
        orderId : uuid.v4(),
        fullName : fullName,
        phoneNumber : phoneNumber,
        address : address,
        additionalInfo : additionalInfo,
        reward : reward,
        promoCode : promoCode,
        isPaid : false,
        orderStatus: "Pending",
        paymentMethod: paymentMethod,
        deliveryDate:  nextweek
    }
    for (let index = 0; index < order.products.length; index++) {
        var product = await productController.getProduct(order.products[index].product);
        product.stock = Number(product.stock) - Number(order.products[index].quantity);
        await productController.updateProductStock(product,order.products[index].product);
    }
    await orderService.addOrder(order);
    await cartController.deleteCart(cart);
    res.redirect("/");
};

const getOrderById = async (id) => {
    var order = await orderService.getOrderById(id)
    return order;
};

module.exports = {
    get_Order,
    makeOrder,
    getOrderById
}