const orderService = require("../models/order-model");
const cartController = require("../controllers/cartController")
const productController = require("../controllers/productController")
const userController = require("../controllers/authController")
const uuid = require("uuid");

const get_Order = async (req, res) => {
    var order = await cartController.getCartById(req.user.id);
    var userPoints = req.user.points;
    if(order){
        res.render('order',{order: order,userPoints: userPoints, title: "Your Order"});
    }
    else{
        req.flash("error", "Cart Doesnt Have any Items !!");
        res.redirect("/cart/");
    }
};

const makeOrder = async (req, res) => {
    var cart = await cartController.getCartById(req.user.id);
    const {fullName, address, usedPoints, phoneNumber, additionalInfo, reward , promoCode} = req.body;
    var total = cart.totalPrice;
    var today = new Date();
    var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()+7); 
    var userPoints = req.user.points;
    var pointsUsed = 0;
    console.log(usedPoints)
    if(usedPoints == "true"){
        pointsUsed = req.user.points;
        userPoints = Number(userPoints) - Number(pointsUsed);
        total = cart.totalPrice - (req.user.points*0.01);
    }

    var order = {
        buyerId : cart.userId,
        cartId : cart.id,
        products : cart.products,
        subTotal : cart.totalPrice,
        pointsUsed: pointsUsed,
        totalPrice : total,
        orderId : uuid.v4(),
        fullName : fullName,
        phoneNumber : phoneNumber,
        address : address,
        additionalInfo : additionalInfo,
        reward : reward,
        promoCode : promoCode,
        isPaid : false,
        orderStatus: "Pending",
        paymentMethod: "PayPal",
        deliveryDate:  nextweek //To Be Changed with implementaion of Delivery
    }

    for (let index = 0; index < order.products.length; index++) {
        var product = await productController.getProduct(order.products[index].product);
        product.stock = Number(product.stock) - Number(order.products[index].quantity);
        await productController.updateProductStock(product,order.products[index].product);
    }

    userPoints = Number(userPoints) + Number(reward);

    await orderService.addOrder(order);
    await cartController.deleteCart(cart);
    await userController.updateUserPoints(req.user.id,userPoints);

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