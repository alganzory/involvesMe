const orderService = require("../models/order-model");
const UserService = require("../models/user-Model")
const ProductService = require("../models/product-model")
const uuid = require("uuid");
const e = require("express");


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
        console.log(canceledOrder)
    }else{
        req.flash(
            "cannotcancel",
            "Sorry! Order cannot be canceled, because the order is "+orderStatus
        )
    }

    res.redirect("/order/")
};

module.exports = {
    cancelOrder,
}