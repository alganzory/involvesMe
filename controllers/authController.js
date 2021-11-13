const USERS = [];

const getUserByEmail = (email) => USERS.find((user) => user.email === email);
const getUserById = (id) => USERS.find((user) => user.id === id);

const bcrypt = require("bcrypt");
const passport = require("passport");

const initializePassport = require("../passport-config");
initializePassport(passport, getUserByEmail, getUserById);
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

const get_login = (req, res) => {
  res.render("sign-in", {title:"Sign in"});
};

const passportAuth = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/auth/login",
  failureFlash: true,
});

const get_register = (req, res) => {
  res.render("sign-up", {title:"Sign up"});
};

const register_user = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    USERS.push({
      email: req.body.email,
      password: hashedPassword,
      id: Date.now().toString(),
    });
    res.redirect("/auth/login");
  } catch (err) {
    console.log(err);
    res.redirect("/auth/register");
  }

  console.log(USERS);
};

const logout_user = (req, res) => {
  req.logOut();
  res.redirect("/");
};
// export the middleware
module.exports = {
  getUserByEmail,
  getUserById,
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
