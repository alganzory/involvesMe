const UserService = require("../models/user-Model");

const get_myaccount = (req, res) => {
    res.render("my-account",{user: req.user , title: "My Account"});
};
const change_username = (req, res) => {
    var query = req.user.username;
    var newData = req.body.username;
    console.log(query+" "+newData)
    UserService.findOneAndUpdate(query, newData, {upsert: false}, function(err, doc) {
        if (err) return res.send(500, {error: err});
        return res.send('Succesfully saved.');
    });
};

module.exports ={
    get_myaccount,
    change_username
}