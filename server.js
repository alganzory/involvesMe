if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const flash = require('express-flash');
// const session = require('express-session');
const cookieSession = require('cookie-session');
const passport = require("passport")

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

app.use('/auth/', authRouter);
app.get('/', indexRouter);


app.listen(3000, () => {
    console.log("Express on port 3000")
});