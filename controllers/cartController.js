const cartService = require("../models/cart-model");
const productController = require("../controllers/productController");
const uuid = require("uuid");


const get_Cart = async (req, res) => {
    var cart = await cartService.getCartByuserId(req.user.id);
    res.render('viewCart', { cart: cart, title: "View Cart" });
};


const addToCart = async (req, res) => {
    var cartSearch = await cartService.getCartByuserId(req.user.id);
    var product = await productController.GetProductObject(req.body.productId);
    var stockAvailable = await productController.isAvailableStock(product.stock, req.body.quantity)
    var totalpriceItem = product.price * req.body.quantity;
    var skip = false;
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
        }
        else {
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
                    }
                    else {
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
                }
                else {
                    var cart = {
                        userId: cartSearch.userId,
                        id: cartSearch.id,
                        products: cartSearch.products,
                        totalPrice: totalprice
                    };
                }
            }
            await cartService.updateCart(req.user.id, cart);
        }
        else {
            var cart = {
                userId: req.user.id,
                id: uuid.v4(),
                products: productObject,
                totalPrice: totalprice
            };
            await cartService.addCart(cart);
        }
        if(skip == true){
            req.flash("error", "Your Cart Has the Maxiumun Number of this item thats available in stock");
            res.redirect("/cart/");
        }
        else{
            res.redirect("/cart/");
        }
    }
    else {
        req.flash("error", "Product is Out of Stock!");
        res.redirect("/cart/");
    }
};


module.exports = {
    get_Cart,
    addToCart
};
