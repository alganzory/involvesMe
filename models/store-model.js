let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const storeSchema = new Schema(
  {
    // this is basically the user ID
    id: {
      type: String,
      default: null,
    },
    storeName: String,
    storeDesc: String,
    products: { type: Array, default: [] },
    storePhoto: String,
  },
  { timestamps: true }
);
const Store = mongoose.model("store", storeSchema, "store");

exports.getStoreById = async (id) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await Store.findOne({ id });
  } catch (error) {
    console.error(error);
  }
};

exports.getStoreByUserId = async (userId) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await Store.findOne({ id: userId });
  } catch (error) {
    console.error(error);
  }
};

exports.addStore = async (store) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const newStore = new Store(store);
    await newStore.save();
    return newStore;
  } catch (error) {
    console.error(error);
  }
};
exports.updateStore = async (id, store) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Store.findOneAndUpdate({ id }, store);
  } catch (error) {
    console.error(error);
  }
};

exports.createOrUpdateStore = async (id, store) => {
  // try to find the user, if they exist we pass store to update, if not we pass it to add
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const newStore = await Store.findOne({ id: id });
    if (newStore) {
      return await exports.updateStore(id, store);
    } else {
      store.id = id;
      return await exports.addStore(store);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.addProductToStore = async (storeId, productId) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const store = await Store.findOne({ id: storeId });
    store.products.push(productId);
    await store.save();
  } catch (error) {
    console.error(error);
  }
};

exports.removeProductFromStore = async (storeId, productId) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const store = await Store.findOne({ id: storeId });
    store.products = store.products.filter((product) => product !== productId);
    await store.save();
  } catch (error) {
    console.error(error);
  }
};


exports.storeModel = Store;
