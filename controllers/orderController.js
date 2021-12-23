const orderService = require("../models/order-model");
const cartController = require("../controllers/cartController")
const productController = require("../controllers/productController")
const userController = require("../controllers/authController")
const uuid = require("uuid");
const paypal = require('paypal-rest-sdk');
const { findOrCreate } = require("../models/user-Model");

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AdwSTeWJSFnq0J5a2xC_Ny9-yNFiDgQZRKOoMdZBvqkKKgWwC2PbxmVgDjtt7wgrCb5NnGBdcHCZwVox',
    'client_secret': 'ECNDDF5DKBFvH_z18ac9UqLI4xqeIabAXJA8du1I9gUAdnsWB_K4sg-91ZQ1kW3QP5gLDovF1x7ONA1M'
  });

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
    
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/order/success/"+order.orderId,
            "cancel_url": "http://localhost:3000/order/cancel"
        },
        "transactions": [{
            
            "amount": {
                "currency": "MYR",
                "total": order.totalPrice
            },
            "description": "Your Involves Me Order"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (var i = 0; i < payment.links.length; i++)
            {
                if (payment.links[i].rel === 'approval_url')
                {
                    res.redirect(payment.links[i].href);
                }

            }
        }
    });
};

const paymentSuccess = async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const order = await orderService.getOrderById(req.params.id);
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions":[{
            "amount": {
                "currency": "MYR",
                "total": order.totalPrice
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment){
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            var updatedStatus = {
                orderStatus: "Paid",
                isPaid: true
            }
            /*for (let index = 0; index < order.products.length; index++) {
                var seller = await storeController.getStoreById(order.products[index].storeId).sellerId
                await userController.updateUserBalance(seller,Number(order.products[index].totalPrice)*0.80);
            }*/
            //Implement after Store controllers has been created (For Updating seller balance)
            await orderService.updateOrder(order.orderId,updatedStatus)
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            req.flash("Success", "Payment Successful, Order will be Shipped Within 3 Working days.");
            res.redirect("/");
        }
    });  
};
const paymentCancelled = async (req, res) => {
    req.flash("error", "Payment Failed or Cancelled");
    res.redirect("/");
};


const getOrderById = async (id) => {
    var order = await orderService.getOrderById(id)
    return order;
};

module.exports = {
    get_Order,
    makeOrder,
    getOrderById,
    paymentSuccess,
    paymentCancelled
}