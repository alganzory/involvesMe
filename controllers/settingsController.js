const UserService = require("../models/user-Model");
const bcrypt = require("bcrypt");
const ProfileService = require("../models/profile-Model");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile-photos",
    format: async (req, file) => "png", // supports promises as well
    public_id: (req, file) => file.originalname,
    transformation: [{ width: 100, height: 500, crop: "limit" }],
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
    profilePhoto: profile?.profilePhoto ? profile?.profilePhoto : null,
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
  var newData = req.body.name;
  await ProfileService.updateProfile(query, { name: newData });

  res.redirect("/settings");
};
const change_bio = async (req, res) => {
  var query = req.user.id;
  var id = req.body.id;
  var newData = req.body.bio;
  // const isExist = await UserService.getUserById(id);

  await ProfileService.updateProfile(query, { bio: newData });

  res.redirect("/settings");
};

const upload_photo = parser.single("profile-photo");
const change_profile_photo = async (req, res) => {
  console.log(req.file);
  res.json(req.file);
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
    if (newpassword.length < 8) {
      req.flash("error", "New Password must be at least 8 characters long");
    } else {
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
