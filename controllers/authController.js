require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const UserService = require("../user");
const initializePassport = require("../passport-config");

initializePassport(passport);
const passportInitialize = passport.initialize();
const passportSession = passport.session();

// middleware to check if the user is authenticated
const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect("/login");
};
const checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    return next();
};
const mongodbUri = "mongodb+srv://admin:vDB3pcBXhkGQIwmN@involvesme.d3lfa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"; //process.env.MONGO_URI;

mongoose.connect(
    mongodbUri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    },
    (error) => {
        if (error) console.log(error);
    }
);
const get_login = (req, res) => {
    res.render("sign-in", { title: "Sign in" });
};
const get_register = (req, res) => {
    res.render("sign-up", { title: "Sign up" });
};
const register_user = async(req, res) => {
    const { type, username, email, password, confirmPassword } = req.body

    if (password.length < 8) {
        req.flash("error", "Account not created. Password must be 7+ characters long");
        return res.redirect("/auth/register");
    }
    if (password != confirmPassword) {
        req.flash("error", "Account not created. Password and confirm password are not the same!");
        return res.redirect("/auth/register");
    }

    if (await UserService.getUserByEmail({ email })) {
        req.flash("error", "Account not created. Email already Exists");
        return res.redirect("/auth/register");
    }
    if (await UserService.getUserByUsername({ username })) {
        req.flash("error", "Account not created. Username is used");
        return res.redirect("/auth/register");
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await UserService.addLocalUser({
            id: uuid.v4(),
            email,
            username,
            password: hashedPassword,
            type: type
        })
        res.redirect("/auth/login")
    } catch (e) {
        req.flash("error", "Error creating a new account. Please Contact Support.");
        res.redirect("/auth/register")
    }
};
const logout_user = (req, res) => {
    req.logOut();
    res.redirect("/");
};
const passportAuth = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
});


module.exports = {
    checkAuthenticated,
    checkNotAuthenticated,
    get_login,
    get_register,
    register_user,
    logout_user,
    passportInitialize,
    passportSession,
    passportAuth,
};