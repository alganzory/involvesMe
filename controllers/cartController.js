const cartService = require("../models/cartModel");
const productController = require("../controllers/productController");
const ProductService = require('../models/productModel')
const uuid = require("uuid");


const get_Cart = async(req, res) => {
    var cart = await cartService.getCartByuserId(req.user.id);
    res.render('viewCart', { cart: cart,usertype: req.user.type, title: "View Cart" });
};



// delete product
const deleteProductFromCart = async(req, res) => {

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


// edit product
const editProductFromCart = async(req, res) => {

    var cartSearch = await cartService.getCartByuserId(req.user.id);
    var edit_id = req.body.productId; //
    console.log("product id: " + edit_id)
    var origanProduct = await ProductService.getProductById(edit_id);
    var origanProduct_stock = origanProduct.stock;

    var quantity = req.body.newQuantity; //test 
    console.log("stock: " + origanProduct_stock)
    console.log("quantity: " + quantity)
    console.log(origanProduct_stock);

    if (quantity <= origanProduct_stock && quantity > 0) {
        for (let index = 0; index < cartSearch.products.length; index++) {
            if (cartSearch.products[index].product == edit_id) {
                cartSearch.totalPrice = Number(cartSearch.totalPrice) - Number(cartSearch.products[index].totalPrice);
                cartSearch.products[index].totalPrice = quantity * Number(cartSearch.products[index].price);
                cartSearch.products[index].quantity = quantity

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
    } else {

        req.flash(
            'outstock',
            "out of stock,current stock is: " + origanProduct_stock
        );

    }
    console.log('edited')
    res.redirect("/cart/");


}

const getCartById = async(userId) => {
    var cart = await cartService.getCartByuserId(userId);
    return cart;
};

const deleteCart = async(userId) => {
    var cart = await cartService.deleteCart(userId);
    return cart;
};

const addToCart = async(req, res) => {
    var cartSearch = await cartService.getCartByuserId(req.user.id);
    var product = await productController.GetProductObject(req.body.productId);
    var stockAvailable = await productController.isAvailableStock(product.stock, req.body.quantity)
    var totalpriceItem = product.price * req.body.quantity;
    var skip = false;
    if (req.body.quantity < 1) {
        req.flash("error", "Product Quanitiy Cannot Be 0 !!");
        res.redirect("/cart/");
    } else {
        if (stockAvailable != false) {
            var productObject = {
                product: product.id,
                store: product.storeId,
                quantity: req.body.quantity,
                price: product.price,
                totalPrice: totalpriceItem,
                name: product.name,
                productThumnail: product.productPhotos[0]
            }

            if (cartSearch != null) {
                var totalprice = cartSearch.totalPrice + (product.price * req.body.quantity);
            } else {
                var totalprice = (product.price * req.body.quantity);
            }
            if (cartSearch != null) {
                var quantitychanged = false;
                for (let index = 0; index < cartSearch.products.length; index++) {
                    if (cartSearch.products[index].product == productObject.product) {
                        var addProductStockCheck = await productController.isAvailableStock(product.stock, (Number(cartSearch.products[index].quantity) + Number(productObject.quantity)));
                        if (addProductStockCheck != false) {
                            cartSearch.products[index].quantity = Number(cartSearch.products[index].quantity) + Number(productObject.quantity);
                            cartSearch.products[index].totalPrice = cartSearch.products[index].price * cartSearch.products[index].quantity;
                            quantitychanged = true;
                        } else {
                            skip = true;
                        }
                    }
                }
                if (skip == false) {
                    if (quantitychanged == false) {
                        await cartSearch.products.push(productObject);
                        var cart = {
                            userId: cartSearch.userId,
                            id: cartSearch.id,
                            products: cartSearch.products,
                            totalPrice: totalprice
                        };
                    } else {
                        var cart = {
                            userId: cartSearch.userId,
                            id: cartSearch.id,
                            products: cartSearch.products,
                            totalPrice: totalprice
                        };
                    }
                }
                await cartService.updateCart(req.user.id, cart);
            } else {
                var cart = {
                    userId: req.user.id,
                    id: uuid.v4(),
                    products: productObject,
                    totalPrice: totalprice
                };
                await cartService.addCart(cart);
            }
            if (skip == true) {
                req.flash("error", "Your Cart Has the Maxiumun Number of this item thats available in stock");
                res.redirect("/cart/");
            } else {
                res.redirect("/cart/");
            }
        } else {
            req.flash("error", "Product is Out of Stock!");
            res.redirect("/cart/");
        }
    }
};


module.exports = {
    get_Cart,
    deleteProductFromCart,
    editProductFromCart,
    getCartById,
    deleteCart,
    addToCart
};