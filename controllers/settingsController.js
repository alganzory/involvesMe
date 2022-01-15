const UserService = require("../models/user-Model");
const bcrypt = require("bcrypt");
const ProfileService = require("../models/profile-Model");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { passwordStrength } = require('check-password-strength');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile-photos",
    // public_id: (req, file) => file.originalname,
    use_filename: false,
    // transformation: [{ width: 200, height: 500, crop: "limit" }],
    allowedFormats: ["jpg", "png", "jpeg"],

  },
});
const parser = multer({ storage: storage });

const get_mysettings = async (req, res) => {
  var passwordVer;
  if (!req.user.password) {
    passwordVer = false;
  } else {
    passwordVer = true;
  }
  var profile = await ProfileService.getProfileById(req.user.id);

  if (!profile) {
    req.flash(
      "noProfile",
      "Create your profile by filling in the details below"
    );
  }

  var profile_data = {
    displayName: profile?.displayName ? profile?.displayName : null,
    bio: profile?.bio ? profile?.bio : null,
    profilePhoto: profile?.profilePhoto ? profile?.profilePhoto : "https://res.cloudinary.com/involvesme/image/upload/v1638402349/profile-photos/default_pp.png",
  };

  var usertype = req.user.type;

  res.render("settings", {
    passwordVer: passwordVer,
    usertype: usertype,
    username: req.user.username,
    useremail: req.user.email,
    title: "My Settings",
    displayName: profile_data.displayName,
    bio: profile_data.bio,
    profilePhoto: profile_data.profilePhoto,
  });
};

const change_username = async (req, res) => {
  var query = req.user.id;
  var newData = req.body.username;
  const isExist = await UserService.getUserByUsername(newData);
  if (isExist && isExist.id != query) {
    req.flash("error", "Username is already taken");
  } else {
    await UserService.updateUser(query, { username: newData });
  }
  res.redirect("/settings");
};

const change_name = async (req, res) => {
  var query = req.user.id;
  var newData = req.body.displayname;
  try {
    await ProfileService.createOrUpdateProfile(query, { displayName: newData });
  }
  catch (e) {
    console.error(e)
    res.json(e);
  }
  res.redirect("/settings");
};
const change_bio = async (req, res) => {
  var query = req.user.id;
  var id = req.body.id;
  var newData = req.body.bio;

  try {
    await ProfileService.createOrUpdateProfile(query, { bio: newData });
  }
  catch (e) {
    console.error(e)
    res.json(e)
  }
  res.redirect("/settings");
};

const upload_photo = parser.single("profile-photo");

const change_profile_photo = async (req, res) => {
  console.log(req.file);
  const profile_photo_url = req.file.path;

  try {
    await ProfileService.createOrUpdateProfile(req.user.id, { profilePhoto: profile_photo_url });

  } catch (e) {
    res.json(e);
  }
  res.redirect("/settings");

};
const change_email = async (req, res) => {
  var query = req.user.id;
  var newData = req.body.email;
  const isExist = await UserService.getUserByEmail(newData);
  if (isExist && isExist.id != query) {
    req.flash("error", "Email is already registered");
  } else {
    await UserService.updateUser(query, { email: newData });
  }
  res.redirect("/settings");
};

const change_password = async (req, res) => {
  var query = req.user.id;
  var oldpassword = req.body.password;

  var newpassword = req.body.newpassword;
  if (oldpassword && !bcrypt.compareSync(oldpassword, req.user.password)) {
    req.flash("error", "Incorrect Current Password");
  } else {
    if ((passwordStrength(newpassword).value) === "Too weak" || (passwordStrength(newpassword).value) === "Weak") {
      req.flash("error", "Password Must contain atleast 1 symbol, 1 Upper Case Letter, 1 Number and be 8 charactes long.");
    }
    else {
      const hashedNewPassword = await bcrypt.hash(newpassword, 10);
      await UserService.updateUser(query, { password: hashedNewPassword });
    }
  }
  res.redirect("/settings");
};
const change_type = async (req, res) => {
  var query = req.user.id;
  var newData = "creator";
  await UserService.updateUser(query, { type: newData });
  res.redirect("/settings");
};

const delete_account = async (req, res) => {
  var query = req.user.id;
  await UserService.deleteUser(query);
  res.redirect("/auth/logout");
};
module.exports = {
  get_mysettings,
  change_username,
  change_name,
  change_bio,
  change_email,
  change_password,
  change_type,
  delete_account,
  upload_photo,
  change_profile_photo,
};
