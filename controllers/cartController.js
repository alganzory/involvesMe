const cartService = require("../models/cart-model");
// const productController = require("../controllers/productController");

const ProductService = require('../models/product-model')
const uuid = require("uuid");


const get_Cart = async (req, res) => {
    var cart = await cartService.getCartByuserId(req.user.id);
    res.render('viewCart',{cart: cart, title: "View Cart"});
};


// delete product
const deleteProductFromCart = async(req, res)=>{
    
    var cartSearch = await cartService.getCartByuserId(req.user.id);
  
    var delete_id = req.body.productId;
  

    //finc specific product in cart
    for (let index = 0; index < cartSearch.products.length; index++) {
        // if find
        if (cartSearch.products[index].product == delete_id) {
           
           
            //update the total price 
            cartSearch.totalPrice = Number(cartSearch.totalPrice) - Number(cartSearch.products[index].totalPrice);
           
            //remove the object
            cartSearch.products.splice(index, 1);

            
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
    //  await cartService.deleteProductById(cartId, delete_id);
   
     console.log('deleted')
      res.redirect("/cart/");
      
}


/*For Testing only 
const addToCart = async (req, res) => {
    var product = {
        product: req.body.productId,
        store: req.body.storeId,
        quantity: req.body.quantity,
    }
    var totalprice1 = await productController.ProductService.getProductById("999");
    console.log(totalprice1)
    var totalprice = totalprice1.price * req.body.quantity;
    
    console.log(totalprice)
    var cart = {
        userId: req.user.id,
        id: uuid.v4(),
        products: product,
        totalPrice: totalprice
    };
    await cartService.addCart(cart);

    return res.redirect("/");
};*/




module.exports = {
    get_Cart,
    deleteProductFromCart,
   
    //addToCart
};
