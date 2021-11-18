let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const userSchema = new Schema({
  id: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: [true, "email required"],
    unique: [true, "email already registered"],
  },
  username: String,
  profilePhoto: String,
  password: String,
  type: String,
  source: { type: String, required: [true, "source not specified"] },
  lastVisited: { type: Date, default: new Date() },
});
const User = mongoose.model("user", userSchema, "user");
// var userModel = mongoose.model("user", userSchema, "user");

exports.userModel = User;

exports.addUser = async (user) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const newUser = new User(user);
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error(error);
  }
};
exports.getUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await User.find({});
  } catch (error) {
    console.error(error);
  }
};

exports.getUserByEmail = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await User.findOne({ email });
  } catch (error) {
    console.error(error);
  }
};

exports.getUserById = async (id) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await User.findOne({ id });
  } catch (error) {
    console.error(error);
  }
};

exports.getUserByUsername = async (username) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await User.findOne({ username });
  } catch (error) {
    console.error(error);
  }
};

exports.findOrCreate = async (id, user) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const currentUser = await User.findOne({ id });
    if (!currentUser) {
      const newUser = await exports.addUser(user);
      return newUser;
    } else {
        console.log ("google account already registered, logging in instead..");
      return currentUser;
    }
  } catch (error) {
    console.error(error);
  }
};