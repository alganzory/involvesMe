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
    var oldpassword = req.body.password;
    
    var newpassword = req.body.newpassword;
    if (oldpassword && !bcrypt.compareSync(oldpassword, req.user.password)) {
        req.flash("error","Incorrect Current Password");
    }
    else {
        if (newpassword.length < 8) {
            req.flash("error", "New Password must be at least 8 characters long");
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