if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

const uuid = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../models/user-Model");

const jwt = require("jsonwebtoken");

require("../passport-config");

const sendEmail = require("../nodemailer");

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
  process.env.MONGO_URI,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
  (error) => {
    if (error) console.log(error);
  }
);
const get_login = (req, res) => {
  res.render("sign-in", {
    title: "Sign in",
    errorMessages: req.flash("resetError"),
    successMessages: req.flash("success"),
  });
};
const get_register = (req, res) => {
  res.render("sign-up", {
    title: "Sign up",
    errorMessages: req.flash("registerError"),
  });
};
const register_user = async (req, res) => {
  const { type, username, email, password, confirmPassword } = req.body;
  if (await User.getUserByUsername(username)) {
    req.flash("registerError", "Account not created. Username is used");
    return res.redirect("/auth/register");
  }
  if (await User.getUserByEmail(email)) {
    req.flash("registerError", "Account not created. Email already Exists");
    return res.redirect("/auth/register");
  }
  if (password.length < 8) {
    req.flash(
      "registerError",
      "Account not created. Password must be 8 characters long at least"
    );
    return res.redirect("/auth/register");
  }
  if (password != confirmPassword) {
    req.flash(
      "registerError",
      "Account not created. Password and confirm password are not the same!"
    );
    return res.redirect("/auth/register");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUserData = {
      id: uuid.v4(),
      email,
      username,
      password: hashedPassword,
      type: type,
      source: "local",
    };
    const newUser = await User.addUser(newUserData);
    res.redirect("/auth/login");
  } catch (e) {
    console.error(e);
    req.flash("registerError", "Error creating a new account. Please Contact Support.");
    res.redirect("/auth/register");
  }
};

const get_forgot_password = (req, res) => {
  res.render("forgot-password", {
    title: "Forgot Password",
    errorMessages: req.flash("forgotError"),
  });
};

const sendResetPasswordEmail = (email,token,id) => {
  const data = {
    to: email,
    subject: "Reset Password",
    html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="${process.env.CLIENT_URL}/auth/reset-password/${token}/${id}">link</a> to reset your password</p>
        `,
  };
  sendEmail(data.to, data.subject, data.html);
}
const post_forgot_password = async (req, res) => {
  const { email } = req.body;
  const user = await User.getUserByEmail(email);
  if (!user) {
    req.flash("forgotError", "No account exists with this email address");
    return res.status(400).redirect("/auth/forgot-password");
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  try {
    // we encrypt the token before storing it in the db
    const hashedToken = await bcrypt.hash(token, 10);
    await User.updateUser(user.id, { resetPasswordToken: hashedToken });
    sendResetPasswordEmail(user.email, token, user.id);
    req.flash("success", "Password reset link sent to your email");
    return res.status(200).redirect("/auth/login");
  } catch (e) {
    console.error(e);
    req.flash("resetError", "Error resetting password. Please contact support");
    console.log(e);
    return res.redirect("/auth/login");
  }
};

const verifyResetLink = async (userId, token) => {
  const user = await User.getUserById(userId);

    let isValidToken = true;

    if (!user) {
      console.log("invalid token: didnt find user through id search");
      isValidToken = false;
    }

    if (!bcrypt.compareSync(token, user.resetPasswordToken)) {
      console.log("invalid token: tokens dont match., bcrypt says");
      isValidToken = false;
    }

    if (!isValidToken) throw new Error("Invalid/Expired reset link!");

    jwt.verify(token, process.env.JWT_SECRET);
}

const get_reset_password = async (req, res) => {
  const token = req.params.token;
  const userId = req.params.id;
  try {
    
    await verifyResetLink (userId, token);

    return res.render("reset-password", {
      title: "Reset Password",
      token: token,
      userId: userId,
      errorMessages: req.flash("resetError"),
    });

  } catch (e) {
    console.log(e);
    return res.status(400).send(`Invalid/Expired reset link! <a href="/auth/login"> Try again </a> `);
  }
};

const sendSuccessfulResetEmail = (email) => {
  const data = {
    to: email,
    subject: "Password Reset",
    html: `
        <p>Your involvesMe account password was reset successfully. </p>
        `,
  };
  sendEmail(data.to, data.subject, data.html);
}

const post_reset_password = async (req, res) => {
  const { password, confirmPassword, token, userId } = req.body;
  const thisLink = `/auth/reset-password/${token}/${userId}`;
  if (password.length < 8) {
    req.flash("resetError", "Password must be 8 characters long at least");
    console.log("password length");
    return res.redirect(`/auth/reset-password/${token}/${userId}`);
  }
  if (password != confirmPassword) {
    req.flash("resetError", "Password and confirm password are not the same!");
    console.log("password match");
    return res.redirect(thisLink);
  }
  
  
  try {

    const user = await User.getUserById(userId);

    if (!user) throw new Error("Invalid/Expired reset link!");
    
    if (user.password && bcrypt.compareSync(password, user.password)) {
      req.flash("resetError", "Your new password can't be the same as the old one");
      return res.redirect(thisLink);
    }

    await verifyResetLink(userId, token)

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword)
    await User.updateUser(userId, {
      password: hashedPassword,
      resetPasswordToken: null,
    });
    
    req.flash("success", "Password reset successfully");
    sendSuccessfulResetEmail(user.email);
    res.status(200).redirect("/auth/login");
  } catch (e) {
    console.log(e);
    req.flash("forgotError", "Invalid/Expired reset link, please try again");
    return res.status(400).redirect("/auth/forgot-password");
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

const passportGoogleAuth = passport.authenticate("google", {
    scope: ["profile", "email"],
    failureRedirect: "/auth/login",
    failureFlash: "Account already exists, sign in with credentials"
  });
const google_redirect = (req, res) => {
  res.redirect("/");
};

const passportTwitchAuth =  passport.authenticate("twitch", { failureRedirect: "/auth/login",failureFlash: "Account already exists, sign in with credentials" });
const twitch_redirect =  (req, res) => {
    res.redirect("/");
};

const updateUserBalance = async (userId, balance) => {
  updatedUser = {
    balance: balance
  }
  await User.updateUser(userId,updatedUser)
};

const updateUserPoints = async (userId, points) => {
  updatedUser = {
    points: points
  }
  await User.updateUser(userId,updatedUser)
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
  get_forgot_password,
  post_forgot_password,
  get_reset_password,
  post_reset_password,
  updateUserBalance,
  updateUserPoints
};
