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
const path = require('path');
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
app.use(express.static(path.join(__dirname, 'assets')));

const indexRouter = require("./routes/landing-route.js");
const authRouter = require("./routes/auth-route.js");
const settingsRouter = require("./routes/settings-route.js");
const profileRouter = require('./routes/profile-route.js');
const storeRouter = require('./routes/store-route.js');
const productRouter = require('./routes/product-route.js');
const cartRouter = require('./routes/cart-route');
const orderRouter = require('./routes/order-route');
const postRouter = require('./routes/post-route');
const walletRouter = require('./routes/wallet-route');

app.use('/auth/', authRouter);
app.use('/settings/', settingsRouter);
app.use('/profile/', profileRouter);
app.use('/store', storeRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/post', postRouter);
app.use('/wallet', walletRouter);
app.use('/', indexRouter);

const host = '0.0.0.0';
const port = process.env.PORT || 3000;
app.listen(port, host, () => {
    console.log(`Listening on port ${port}`);   
});
