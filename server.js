if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const flash = require('express-flash');
const session = require('express-session');


app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));


app.set("views", "pages");
app.set("view engine", "ejs");
app.use (express.json())
app.use (express.urlencoded({extended: false}));
app.use (express.static("assets"));

const indexRouter = require ("./routes/index.js");
const authRouter = require ("./routes/auth-route.js");

app.use('/auth/', authRouter);
app.get ('/', indexRouter);


app.listen(3000, ()=> {
  console.log("Express on port 3000")
});
