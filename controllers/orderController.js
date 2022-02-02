const orderService = require("../models/order-model");
const cartController = require("../controllers/cartController")
const productController = require("../controllers/productController")
const userController = require("../controllers/authController")
const walletController = require("../controllers/walletController")
const uuid = require("uuid");
const paypal = require('paypal-rest-sdk');
const { findOrCreate } = require("../models/user-Model");
const UserService = require("../models/user-Model")
const ProductService = require("../models/product-model")
const e = require("express");

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AdwSTeWJSFnq0J5a2xC_Ny9-yNFiDgQZRKOoMdZBvqkKKgWwC2PbxmVgDjtt7wgrCb5NnGBdcHCZwVox',
    'client_secret': 'ECNDDF5DKBFvH_z18ac9UqLI4xqeIabAXJA8du1I9gUAdnsWB_K4sg-91ZQ1kW3QP5gLDovF1x7ONA1M'
});

const get_Order = async (req, res) => {
    var order = await cartController.getCartById(req.user.id);
    var userPoints = await walletController.getWalletObject(req.user.id);
    userPoints = userPoints.points;
    if (order) {
        res.render('order', { order: order, usertype: req.user.type, userPoints: userPoints, title: "Your Order" });
    }
    else {
        req.flash("error", "Cart Doesnt Have any Items !!");
        res.redirect("/cart/");
    }
};

const getCancelOrder = async (req, res) => {
    res.render("cancelOrder", { usertype: req.user.type })
};


const get_Order_Creator = async (req, res) => {
    var order = await orderService.getOrderBysellerId();
    var orders = new Array;
    for (var i = 0; i < order.length; i++) {
        for (let index = 0; index < order[i].products.length; index++) {
            if (order[i].products[index].store === req.user.id) {
                console.log("found");
                orders.push(order[i]);
            }
        }
    }
    var orderss = new Set(orders);
    orders = Array.from(orderss);
    console.log(req.user.type);
    res.render('viewOrder', { order: orders, usertype: req.user.type, title: "Your Order" });

};

const get_Orders = async (req, res) => {
    var orders = await orderService.getOrdersByuserId(req.user.id);
    if (!orders[0]) {
        req.flash("error", "You Doesnt Have any Orders !!");
        res.redirect("/");
    }
    else {
        console.log(orders);
        res.render('manageOrder', { orders: orders, user: req.user, usertype: req.user.type, title: "Your Orders" });
    }
};

const makeOrder = async (req, res) => {
    var cart = await cartController.getCartById(req.user.id);
    var userwallet = await walletController.getWalletObject(req.user.id);
    const { fullName, address, usedPoints, phoneNumber, additionalInfo, reward, promoCode } = req.body;
    var total = cart.totalPrice;
    var today = new Date();
    var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    var userPoints = 0;
    var pointsUsed = 0;

    if (userwallet.points > 0) {
        userPoints = userwallet.points;
        console.log("Points found : " + userPoints)
    }
    console.log(usedPoints)
    if (usedPoints == "true") {
        pointsUsed = userPoints;
        userPoints = Number(userPoints) - Number(pointsUsed);
        total = parseFloat(cart.totalPrice - (pointsUsed * 0.01)).toFixed(2)
        console.log("Total price reduced : " + total)
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
        userwallet.points = userPoints
        await walletController.updateWallet(userwallet);
        console.log("Added points")

        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/order/success/" + order.orderId,
                "cancel_url": "http://localhost:3000/order/cancelPayment"
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

const cancelOrder = async (req, res) => {

    //get order id
    var orderId = req.body.orderId;
    console.log("order id is: " + orderId);

    //search the order
    var orderSearch = await orderService.getOrderById(orderId);
    console.log(orderSearch);

    var orderStatus = orderSearch.orderStatus;
    console.log("order status: " + orderStatus);

    //cancel order only for pending orders -->restore the product,
    if (orderSearch.orderStatus == "pending" || orderSearch.orderStatus == "Pending" || orderSearch.orderStatus == "Paid") {
        console.log("ready to cancel");
        for (let i = 0; i < orderSearch.products.length; i++) {

            //get product id of each product
            var productId = orderSearch.products[i].product;

            //get quantity of each product
            var productQuantity = orderSearch.products[i].quantity;

            // search the particular product in product collection
            var productSearch = await ProductService.getProductById(productId);
            var productStock = productSearch.stock;

            //update the new stock to product collection
            var newStock = Number(productQuantity) + Number(productStock);
            console.log("the new stock is: " + newStock)//test

            await ProductService.updateStock(productId, newStock);

        }

        //3. refund
        var totalPrice = orderSearch.totalPrice;
        var reward = orderSearch.reward;
        var pointsUsed = orderSearch.pointsUsed;


        //3.1 get buyer info
        console.log("Started Buyer info")
        var buyer = await walletController.getWalletObject(req.user.id);

        //3.2 update the points
        var upatedPoints = Number(buyer.points) - Number(reward) + Number(pointsUsed);
        buyer.points = upatedPoints;
        await walletController.updateWallet(buyer);

        //3.3 update the balance
        if (orderSearch.orderStatus == "Paid") {
            console.log("started refund")
            var refund = {
                "amount": {
                    "currency": "MYR",
                    "total": orderSearch.totalPrice
                }
            },
                saleId = orderSearch.saleId;
            console.log("Created refund object")

            paypal.sale.refund(saleId, refund, function (error, refund) {
                if (error) {
                    throw error;
                } else {
                    console.log("Refund Sale Response");
                    console.log(JSON.stringify(refund));
                }

            });
        }

        //4. change the status of the order
        var canceledOrder = await orderService.updateOrderStatus(orderId, "canceled")


    } else {
        req.flash(
            "cannotcancel",
            "Sorry! Order cannot be canceled, because the order is " + orderStatus
        )
    }

    res.redirect("/order/orders")
};

module.exports = {
    get_Order,
    makeOrder,
    getOrderById,
    paymentSuccess,
    paymentCancelled,
    cancelOrder,
    getCancelOrder,
    get_Order_Creator,
    get_Orders
}