const UserService = require("../models/user-Model");
const ProfileService = require("../models/profile-Model");
const PostController = require("../controllers/postController");


const get_myprofile = async (req, res) => {
    var profile = await ProfileService.getProfileById(req.user.id);
    var posts = await PostController.get_userposts(req.user.id);
    if(profile){
        res.render("profile",{profile: profile,posts: posts, title: "My Profile"});
    }
    else{
        res.render("profile",{profile: null,posts: posts, title: "My Profile"});
    }
};

const get_profile = async (req, res) => {
    var usernameURL = req.params.username;
    var searchedUser = await UserService.getUserByUsername(usernameURL);
    if(searchedUser){
        var profile = await ProfileService.getProfileById(searchedUser.id)
        var posts = await PostController.get_userposts(searchedUser.id);
        if(profile){
            res.render("profile",{profile: profile,posts: posts, title: (usernameURL +"'s Profile")});
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
const add_post = async (req, res) => {
    var post = {
        userId: req.user.id,
        title: req.body.title,
        content: req.body.content
    }
    PostController.addUserPost(post);
    res.redirect("/profile/me");
};

module.exports = {
    get_myprofile,
    get_profile,
    edit_myprofile,
    add_post
}