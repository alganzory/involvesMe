let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const profileSchema = new Schema({
  id: {
    type: String,
    default: null,
  },
  displayName: String,
  bio: String,
  followers: { type : Array , "default" : [] },
  following: { type : Array , "default" : [] },
  profilePhoto: String,
  patreonSocial: String,
  youtubeSocial: String,
  facebookSocial: String,
  twitterSocial: String,
  storeName: String, // TODO: change to store model
  storeDesc: String // TODO: change to store model
}, { timestamps: true });
const Profile = mongoose.model("profile", profileSchema, "profile");
mongoose.models={};
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

exports.updateFollows = async (follower ,following,action) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    switch(action) {
      case 'follow':
          await Promise.all([ 
            console.log("im here follow"),
            Profile.findOneAndUpdate({ id: follower },  { $push: { following: following} }),
            Profile.findOneAndUpdate({ id: following }, { $push: { followers: follower} }).clone()
          ]);
      break;

      case 'unfollow':
          await Promise.all([ 
            console.log("im here unfollow"),
            Profile.findOneAndUpdate({ id: follower }, { $pull: { following: following} }),
            Profile.findOneAndUpdate({ id: following }, { $pull: { followers: follower} }).clone(),
          ]);
      break;

      case 'remove':
          await Promise.all([ 
            console.log("im here remove"),
            Profile.findOneAndUpdate({ id: following }, { $pull: { followers: follower} }),
            Profile.findOneAndUpdate({ id: follower }, { $pull: { following: following} }).clone(),
          ]);
      break;

      default:
          break;
  }
  } catch (error) {
    throw error;
  }
};

exports.createOrUpdateProfile = async (id, profile) => {

  // try to find the user, if they exist we pass profile to update, if not we pass it to add 
    try {
    await mongoose.connect(process.env.MONGO_URI);

    const newProfile = await Profile.findOne({ id: id });
    if (newProfile) {
      return await exports.updateProfile(id, profile);      

    } else {
      profile.id = id;
      return await exports.addProfile(profile);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

exports.getAllOtherProfiles = async (id) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const profiles = await Profile.find({ id: { $ne: id } });
    return profiles;
  } catch (error) {
    console.error(error);
  }
}