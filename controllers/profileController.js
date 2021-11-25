const UserService = require("../models/user-Model");
const ProfileService = require("../models/profile-Model");

const get_myprofile = async (req, res) => {
    var profile = await ProfileService.getProfileById(req.user.id)
    if(profile){
        res.render("profile-page",{profile: profile, title: "My Profile"});
    }
    else{
        res.render("profile-page",{profile: null, title: "My Profile"});
    }
};

const get_profile = async (req, res) => {
    var usernameURL = req.params.username;
    var searchedUser = await UserService.getUserByUsername(usernameURL);
    if(searchedUser){
        var profile = await ProfileService.getProfileById(searchedUser.id)
        if(profile){
            res.render("profile-page",{profile: profile, title: (usernameURL +"'s Profile")});
        }
        else{
            //res.send (`<h1> User haven't created a profile </h1>`);
            req.flash("error","User haven't created a profile."); //#for Later implementation
            res.redirect("/");
        }
    }
    else{
        //res.send (`<h1> This User Doesn't Exist </h1>`);
        req.flash("error","This User Doesn't Exist"); //#for Later implementation
        res.redirect("/");
    }
    
};

const edit_myprofile = async (req, res) => {
    var profile = await ProfileService.getProfileById(req.user.id)
    if(profile){
        profile = {
            displayName: req.body.displayname,
            Bio: req.body.bio
        }
        console.log(profile)
        await ProfileService.updateProfile(req.user.id,profile);
    }
    else {
        profile = {
            id: req.user.id,
            displayName: req.body.displayname,
            Bio: req.body.bio
        }
        await ProfileService.addProfile(profile);
    }
    res.redirect("/profile/me");
};

module.exports = {
    get_myprofile,
    get_profile,
    edit_myprofile
}