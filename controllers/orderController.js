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

const getCancelOrder = async (req, res) => {
    res.render("cancelOrder")
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
        var product = await productController.GetProductObject(order.products[index].product);
        product.stock = Number(product.stock) - Number(order.products[index].quantity);
        await productController.updateProductStock(product,order.products[index].product);
    }

    userPoints = Number(userPoints) + Number(reward);
    if(order.products.length > 0){
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
                for (var i = 0; i < payment.links.length; i++)
                {
                    if (payment.links[i].rel === 'approval_url')
                    {
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

const cancelOrder = async (req, res) => {
   
    //get order id
    var orderId = req.body.orderId;
    console.log("order id is: "+orderId);

    //search the order
    var orderSearch = await orderService.getOrderById(orderId);
    console.log(orderSearch);

    var orderStatus = orderSearch.orderStatus;
    console.log("order status: "+orderStatus);

    //cancel order only for pending orders -->restore the product,
    if(orderSearch.orderStatus == "pending" || orderSearch.orderStatus == "Pending"){
        console.log("ready to cancel");
        for(let i =0; i< orderSearch.products.length; i++){

            //get product id of each product
            var productId = orderSearch.products[i].product;

            //get quantity of each product
            var productQuantity = orderSearch.products[i].quantity;
            
            // search the particular product in product collection
            var productSearch = await ProductService.getProductById(productId);
            var productStock = productSearch.stock;

            //update the new stock to product collection
            var newStock = Number(productQuantity) + Number(productStock);
            console.log("the new stock is: "+newStock)//test

            await ProductService.updateStock(productId, newStock);

        }

         //3. refund
        var totalPrice = orderSearch.totalPrice;
        var reward = orderSearch.reward;
        var pointsUsed = orderSearch.pointsUsed;

        //3.1 get buyer info
        var buyer = await UserService.getUserById(req.user.id);
        
        //3.2 update the points
        var upatedPoints = Number(buyer.points)-Number(reward)+Number(pointsUsed);

        await UserService.updatePoints(req.user.id, upatedPoints);

        //3.3 update the balance
        var updatedBalance = Number(buyer.balance)+Number(totalPrice);
        await UserService.updateBalance(req.user.id, updatedBalance);

        var updatebuyer = await UserService.getUserById(req.user.id);
        console.log("updated buyer")
        console.log(updatebuyer)
  
        //4. change the status of the order
        var canceledOrder = await orderService.updateOrderStatus(orderId, "canceled")
      
    }else{
        req.flash(
            "cannotcancel",
            "Sorry! Order cannot be canceled, because the order is "+orderStatus
        )
    }

    res.redirect("/order/")
};

module.exports = {
    get_Order,
    makeOrder,
    getOrderById,
    paymentSuccess,
    paymentCancelled,
    cancelOrder,
    getCancelOrder
}