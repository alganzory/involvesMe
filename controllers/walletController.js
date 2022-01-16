const orderService = require("../models/order-model");
const cartController = require("../controllers/cartController")
const productController = require("../controllers/productController")
const userController = require("../controllers/authController")
const uuid = require("uuid");
const paypal = require('paypal-rest-sdk');
const { findOrCreate } = require("../models/user-Model");
const UserService = require("../models/user-Model")
const ProductService = require("../models/product-model")
const e = require("express");

const dontePaypal = async (req, res) => {
    var cart = await cartController.getCartById(req.user.id);
    const { fullName, address, usedPoints, phoneNumber, additionalInfo, reward, promoCode } = req.body;
    var total = cart.totalPrice;
    var today = new Date();
    var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    var userPoints = 0;
    var pointsUsed = 0;

    if (req.user.points) {
        userPoints = req.user.points;
    }
    console.log(usedPoints)
    if (usedPoints == "true") {
        pointsUsed = userPoints;
        userPoints = Number(userPoints) - Number(pointsUsed);
        total = cart.totalPrice - (userPoints * 0.01);
    }

    var order = {
        buyerId: cart.userId,
        cartId: cart.id,
        products: cart.products,
        subTotal: cart.totalPrice,
        pointsUsed: pointsUsed,
        totalPrice: total,
        orderId: uuid.v4(),
        fullName: fullName,
        phoneNumber: phoneNumber,
        address: address,
        additionalInfo: additionalInfo,
        reward: reward,
        promoCode: promoCode,
        isPaid: false,
        orderStatus: "Pending",
        paymentMethod: "PayPal",
        deliveryDate: nextweek //To Be Changed with implementaion of Delivery
    }

    for (let index = 0; index < order.products.length; index++) {
        var product = await productController.GetProductObject(order.products[index].product);
        product.stock = Number(product.stock) - Number(order.products[index].quantity);
        await productController.updateProductStock(product, order.products[index].product);
    }

    userPoints = Number(userPoints) + Number(reward);
    if (order.products.length > 0) {
        await orderService.addOrder(order);
        console.log("Made Order")
        await cartController.deleteCart(cart);
        console.log("Deleted Cart")
        await userController.updateUserPoints(req.user.id, userPoints);
        console.log("Added points")

        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/order/success/",
                "cancel_url": "http://localhost:3000/order/cancelPayment"
            },
            "transactions": [{

                "amount": {
                    "currency": "MYR",
                    "total": order.totalPrice
                },
                "description": "Your Involves Donation"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for (var i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.redirect(payment.links[i].href);
                    }

                }
            }
        });
    }
    else {
        req.flash("error", "Order Doesnt Have any Items !!");
        res.redirect("/cart/");
    }
};

const paymentSuccess = async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const saleId = req.query.saleId;
    const order = await orderService.getOrderById(req.params.id);
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "MYR",
                "total": order.totalPrice
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            var updatedStatus = {
                orderStatus: "Paid",
                paymentId: paymentId,
                saleId: saleId,
                isPaid: true
            }
            /*for (let index = 0; index < order.products.length; index++) {
                var seller = await storeController.getStoreById(order.products[index].storeId).sellerId
                await userController.updateUserBalance(seller,Number(order.products[index].totalPrice)*0.80);
            }*/
            //Implement after Store controllers has been created (For Updating seller balance)
            updatedStatus.saleId = payment.transactions[0].related_resources[0].sale.id;
            await orderService.updateOrder(order.orderId, updatedStatus)
            console.log("Get Payment Response");

            console.log(JSON.stringify(payment));
            req.flash("Success", "Payment Successful.");
            res.redirect("/");
        }
    });
};
const paymentCancelled = async (req, res) => {
    req.flash("error", "Payment Failed or Cancelled");
    res.redirect("/");
};

module.exports = {
    dontePaypal,
    paymentSuccess,
    paymentCancelled
}