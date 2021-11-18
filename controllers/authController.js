require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

const uuid = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../models/user-Model");
 require("../passport-config");


// middleware to check if the user is authenticated
const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect("/auth/login");
};
const checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    return next();
};


mongoose.connect(
    process.env.MONGO_URI, {
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
    if (await User.getUserByUsername(username )) {
        req.flash("error", "Account not created. Username is used");
        return res.redirect("/auth/register");
    }
    if (await User.getUserByEmail( email )) {
        req.flash("error", "Account not created. Email already Exists");
        return res.redirect("/auth/register");
    }
    if (password.length < 8) {
        req.flash("error", "Account not created. Password must be 7+ characters long");
        return res.redirect("/auth/register");
    }
    if (password != confirmPassword) {
        req.flash("error", "Account not created. Password and confirm password are not the same!");
        return res.redirect("/auth/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const newUserData ={
            id: uuid.v4(),
            email,
            username,
            password: hashedPassword,
            type: type,
            source: "local"
        } 
        const newUser = await User.addUser(newUserData);
        res.redirect("/auth/login")
    } catch (e) {
        console.error (e)
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

const passportGoogleAuth = passport.authenticate("google",{ scope: ['profile', 'email'] })
const google_redirect = (req, res) => {
    res.redirect("/");
};

const passportTwitchAuth =  passport.authenticate("twitch", { failureRedirect: "/auth/login" });
const twitch_redirect =  (req, res) => {
    res.redirect("/");
};

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated,
    get_login,
    get_register,
    register_user,
    logout_user,
    passportAuth,
    passportGoogleAuth,
    google_redirect,
    passportTwitchAuth,
    twitch_redirect,
};