const UserService = require("../models/user-Model");
const bcrypt = require("bcrypt");


const get_myaccount = (req, res) => {
    res.render("my-account",{user: req.user , title: "My Account"});
};

const change_username = async (req, res) => {
    var query = req.user.id;
    var newData = req.body.username;
    await UserService.updateUser(query, {username: newData});
    res.redirect("/account");
};

const change_email = async (req, res) => {
    var query = req.user.id;
    var newData = req.body.email;
    await UserService.updateUser(query, {email: newData});
    res.redirect("/account");
};

const change_password = async (req, res) => {
    var query = req.user.id;
    var password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserService.updateUser(query, {password: hashedPassword});
    res.redirect("/account");
};
const change_type = async (req, res) => {
    var query = req.user.id;
    var newData = "creator";
    await UserService.updateUser(query, {type: newData});
    res.redirect("/account");   
};

const delete_account= async (req, res) => {
    var query = req.user.id;
    await UserService.deleteUser(query);
    res.redirect("/auth/logout");
};
module.exports ={
    get_myaccount,
    change_username,
    change_email,
    change_password,
    change_type,
    delete_account
}