const cartService = require("../models/cart-model");
const productController = require("../controllers/productController");
const uuid = require("uuid");


const get_Cart = async (req, res) => {
    var cart = await cartService.getCartByuserId(req.user.id);
    res.render('viewCart',{cart: cart, title: "View Cart"});
};


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


// delete product
const deleteProductFromCart = async(req, res)=>{
    
        
      
    var delete_id = req.params.id;
    
    console.log('delete product id='+delete_id)

   await cartService.deleteProductById(delete_id)
 
   console.log('deleted')
    res.redirect("/cart/");
    
}


module.exports = {
    get_Cart,
    deleteProductFromCart,
    //addToCart
};
