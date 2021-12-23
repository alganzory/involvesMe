if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const flash = require('express-flash');
// const session = require('express-session');
const cookieSession = require('cookie-session');
const passport = require("passport")
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
// set up session cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY]
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());



app.set("views", "pages");
app.set("view engine", "ejs");
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static("assets"));

const indexRouter = require("./routes/landing-route.js");
const authRouter = require("./routes/auth-route.js");
const settingsRouter = require("./routes/settings-route.js");
const profileRouter = require('./routes/profile-route.js');
const storeRouter = require('./routes/store-route.js');
const productRouter = require('./routes/product-route.js');
const cartRouter = require('./routes/cart-route');


app.use('/auth/', authRouter);
app.use('/settings/', settingsRouter);
app.use('/profile/', profileRouter);
app.use('/store', storeRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/', indexRouter);
const port = process.env.PORT || 3000;
app.listen(port);

// setting up paypal payment
var paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AdwSTeWJSFnq0J5a2xC_Ny9-yNFiDgQZRKOoMdZBvqkKKgWwC2PbxmVgDjtt7wgrCb5NnGBdcHCZwVox',
    'client_secret': 'ECNDDF5DKBFvH_z18ac9UqLI4xqeIabAXJA8du1I9gUAdnsWB_K4sg-91ZQ1kW3QP5gLDovF1x7ONA1M'
  });

app.post('/pay', (req, res) => {
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "MYR",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "MYR",
                "total": "1.00"
            },
            "description": "Hi."
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

});


app.get('/success', (req,res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions":[{
            "amount": {
                "currency": "MYR",
                "total": "1.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
           
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.send("success");
        }
    });    
});

app.get('/cancel', (req,res) => res.send("Cancelled"));
