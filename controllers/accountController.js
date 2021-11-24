const UserService = require("../models/user-Model");
const { passwordStrength } = require('check-password-strength');
const bcrypt = require("bcrypt");
const get_myaccount = (req, res) => {
    var passwordVer;
    if(!req.user.password){ 
        passwordVer=false;
    }
    else{
        passwordVer=true;
    }
    var usertype = req.user.type;
    res.render("my-account",{passwordVer: passwordVer,usertype: usertype,username: req.user.username,useremail: req.user.email, title: "My Account"});
};

const change_username = async (req, res) => {
    var query = req.user.id;
    var newData = req.body.username;
    const isExist = await UserService.getUserByUsername(newData);
    if (isExist && isExist.id != query) {
        req.flash("error","Username is already taken");
    }
    else {
        await UserService.updateUser(query, {username: newData});
    }
    res.redirect("/account");
};

const change_email = async (req, res) => {
    var query = req.user.id;
    var newData = req.body.email;
    const isExist = await UserService.getUserByEmail(newData);
    if (isExist && isExist.id != query) {
        req.flash("error","Email is already registered");
    }
    else {
    await UserService.updateUser(query, {email: newData});
    }
    res.redirect("/account");
};

const change_password = async (req, res) => {
    var query = req.user.id;
    var oldpassword = req.body.password;
    
    var newpassword = req.body.newpassword;
    if (oldpassword && !bcrypt.compareSync(oldpassword, req.user.password)) {
        req.flash("error","Incorrect Current Password");
    }
    else {
        if ((passwordStrength(newpassword).value) === "Too weak" || (passwordStrength(newpassword).value) === "Weak") {
            req.flash("error", "Password Must contain atleast 1 symbol, 1 Upper Case Letter, 1 Number and be 8 charactes long.");
        }
        else{
            const hashedNewPassword = await bcrypt.hash(newpassword, 10);
            await UserService.updateUser(query, {password: hashedNewPassword});
        }
    }
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