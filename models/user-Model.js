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
    // name: String,
    // bio: String,
    // profilePhoto: String,
    password: String,
    type: String,
    balance: Number,
    points: Number,
    source: { type: String, required: [true, "source not specified"] },
    lastVisited: { type: Date, default: new Date() },
    resetPasswordToken: {
        type: String,
        default: null,
    }
}, { timestamps: true });
const User = mongoose.model("user", userSchema, "user");
// var userModel = mongoose.model("user", userSchema, "user");
mongoose.models={}
exports.userModel = User;

exports.addUser = async(user) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const newUser = new User(user);
        await newUser.save();
        return newUser;
    } catch (error) {
        console.error(error);
    }
};
exports.getUsers = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        return await User.find({});
    } catch (error) {
        console.error(error);
    }
};

exports.getUserByEmail = async(email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        return await User.findOne({ email });
    } catch (error) {
        console.error(error);
    }
};

exports.getUserById = async(id) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        return await User.findOne({ id });
    } catch (error) {
        console.error(error);
    }
};

exports.getUserByUsername = async(username) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        return await User.findOne({ username });
    } catch (error) {
        console.error(error);
    }
};
// exports.getUserByName = async(name) => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI);
//         return await User.findOne({ name });
//     } catch (error) {
//         console.error(error);
//     }
// };

exports.findOrCreate = async(id, user) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const currentUser = await User.findOne({ id });
        if (!currentUser) {
            const newUser = await exports.addUser(user);
            return newUser;
        } else {
            console.log("account already registered, logging in ...");
            return currentUser;
        }
    } catch (error) {
        console.error(error);
    }
};
exports.updateUser = async(id, user) => {

    try {
        await mongoose.connect(process.env.MONGO_URI);
        const updatedUser = await User.updateOne({ id }, user);
        return updatedUser;
    } catch (error) {
        throw error;
    }
};

exports.deleteUser = async(id) => {

    try {
        await mongoose.connect(process.env.MONGO_URI);
        const updatedUser = await User.deleteOne({ id });
        return updatedUser;
    } catch (error) {
        throw error;
    }
};
exports.getUserByResetPasswordToken = async(resetPasswordToken) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        return await User.findOne({ resetPasswordToken });
    } catch (error) {
        throw error;
    }
};

//related to order

exports.updatePoints = async(userid, returnPoints)=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        const updateStock = await User.updateOne(
          {id: userid},
          {$set: {points: returnPoints}}
        )
      return updateStock;
      }catch(error){
        throw error;
      }
}

exports.updateBalance = async(userid, returnBalance)=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        const updateStock = await User.updateOne(
          {id: userid},
          {$set: {balance: returnBalance}}
        )
      return updateStock;
      }catch(error){
        throw error;
      }
}