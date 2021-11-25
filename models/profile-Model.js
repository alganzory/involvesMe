let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const profileSchema = new Schema({
  id: {
    type: String,
    default: null,
  },
  displayName: String,
  Bio: String,
  followers: { type : Array , "default" : [] },
  following: { type : Array , "default" : [] },
  profilePhoto: String
}, { timestamps: true });
const Profile = mongoose.model("profile", profileSchema, "profile");

exports.profileModel = Profile;

exports.addProfile = async (profile) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const newProfile = new Profile(profile);
    await newProfile.save();
    return newProfile;
  } catch (error) {
    console.error(error);
  }
};

exports.getProfileById = async (id) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await Profile.findOne({ id });
  } catch (error) {
    console.error(error);
  }
};

exports.updateProfile = async (id, profile) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedProfile = await Profile.updateOne({ id }, profile);
    console.log(updatedProfile)
    return updatedProfile;
  } catch (error) {
    throw error;
  }
};

exports.deleteProfile = async (id) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedProfile = await Profile.deleteOne({ id });
    return updatedProfile;
  } catch (error) {
    throw error;
  }
};