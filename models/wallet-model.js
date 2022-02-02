let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const walletSchema = new Schema({
  id: String,
  userId: String,
  balance: Number,
  points: Number,
  paypalAccount: String,
}, { timestamps: true });
const Wallet = mongoose.model("wallet", walletSchema, "wallet");

exports.walletModel = Wallet;

exports.addWallet = async (wallet) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const newWallet = new Wallet(wallet);
    await newWallet.save();
    return newWallet;
  } catch (error) {
    console.error(error);
  }
};

exports.getWalletByuserId = async (userId) => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      var Wallets = await Wallet.findOne({ userId: userId });
      return Wallets;
    } catch (error) {
      console.error(error);
    }
};

exports.getWalletById = async (id) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await Wallet.findOne({ _id: id });
  } catch (error) {
    console.error(error);
  }
};

exports.updateWallet = async (id, wallet) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedWallet = await Wallet.updateOne({ id }, wallet);
    return updatedWallet;
  } catch (error) {
    throw error;
  }
};

exports.deleteWallet = async (id) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedWallet = await Wallet.deleteOne({ id });
    return updatedWallet;
  } catch (error) {
    throw error;
  }
};