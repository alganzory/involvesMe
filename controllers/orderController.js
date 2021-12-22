const orderService = require("../models/order-model");

const ProductService = require("../models/product-model")
const uuid = require("uuid");
const e = require("express");



//cancel order
//1. get the order_id from frontend(input hidde) using req.body.orderId and userId(req.user.id)
//2. find the oder info from database by orderId(and userId) --> get the order payment(money), change the status for the order("cancelled")
//3. for loop to get the ordered products while for each i 
//3.1 get the productId(meanwhile get the product by productId, and get the stock), product quantity(need to restock the product stock), 
//upadate the stock (stock + quantity)
//4. refund to the user
// edit product
const editProductFromCart = async(req, res)=>{
    
    var cartSearch = await cartService.getCartByuserId(req.user.id);//get cart
    

    var edit_id = req.body.productId;//
    console.log("product id: "+edit_id)
    var origanProduct =await ProductService.getProductById(edit_id);
    var origanProduct_stock =origanProduct.stock;

    var quantity = req.body.newQuantity;//test 
    console.log("stock: "+origanProduct_stock)
    console.log("quantity: "+quantity)
    console.log(origanProduct_stock);
    
      if(quantity<=origanProduct_stock && quantity>0){
        for (let index = 0; index < cartSearch.products.length; index++) {
            if (cartSearch.products[index].product == edit_id) {
                cartSearch.totalPrice = Number(cartSearch.totalPrice) - Number(cartSearch.products[index].totalPrice);
                
                  cartSearch.totalPrice = Number(cartSearch.totalPrice) - Number(cartSearch.products[index].totalPrice);
                cartSearch.products[index].totalPrice = quantity *  Number(cartSearch.products[index].price);
                 cartSearch.products[index].quantity= quantity
              
                cartSearch.totalPrice = Number(cartSearch.totalPrice) + Number(cartSearch.products[index].totalPrice);
             
                var cart = {
                    userId: cartSearch.userId,
                    id: cartSearch.id,
                    products: cartSearch.products,
                    totalPrice: cartSearch.totalPrice,
                };
                await cartService.updateCart(req.user.id, cart)
            }
        }
         
        console.log(cartSearch)
     }else{
        
        req.flash(
            'outstock',
            "out of stock,current stock is: "+origanProduct_stock
          );
      
     }

    
   
   
     console.log('edited')
      res.redirect("/cart/");
    
      
}

const cancelOrder = async (req, res) => {
   
    //get order id
    var orderId = req.body.orderId;
    console.log("order id is: "+orderId);

    //search the order
    var orderSearch = await orderService.getOrderById(orderId);
    var orderStatus = orderSearch.orderStatus;
    console.log("order status: "+orderStatus);

    //cancel order only for pending orders -->restore the product,
    if(orderSearch.orderStatus == "pending"){
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

        // change the status of the order
        var canceledOrder = await orderService.updateOrderStatus(orderId, "canceled")

        console.log(canceledOrder);
        //refund
        var totalPrice = orderSearch.totalPrice;
        //to be continued....

        
    }else{
        req.flash(
            "cannotcancel",
            "Sorry! Order cannot be canceled, because the order is "+orderStatus
        )
    }



    // console.log(orderSearch);



    res.redirect("/order/")
};

module.exports = {
    cancelOrder,
}