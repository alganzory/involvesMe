const UserService = require("../models/user-Model");
const StoreService = require("../models/store-Model");
const productController = require("../controllers/productController");
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
    folder: "store-photos",
    // public_id: (req, file) => file.originalname,
    use_filename: false,
    // transformation: [{ width: 200, height: 500, crop: "limit" }],
    allowedFormats: ["jpg", "png", "jpeg"],
  },
});

const parser = multer({ storage: storage });


const get_mystore = async (req, res) => {
  var store = await StoreService.getStoreByUserId(req.user.id);
  console.log(req.user);
  store = store
    ? store
    : {
        storeName: "Create A Store Name",
        storeDesc: "Add A Description",
        storePhoto:
          "https://res.cloudinary.com/involvesme/image/upload/v1639892495/store-photos/defaultstorebanner_l4klev.png",
        storeProducts: [],
      };
  const user = req.user
    ? {
        id: req.user.id,
        type: req.user.type,
        username: req.user.username,
      }
    : null;
  
    let products = [];;
  if (store) {
    console.log (store);
     products = await productController.get_store_products(store.id);

    return res.render("store", { store: store, user: user, products:products, isStoreOwner: true });
  }
  res.render("store", { store: store, user: user, isStoreOwner: true });
};

const get_store = async (req, res) => {
  const username = req.query.username;
  if (!username) return res.redirect("/");
  if (username === req.user.username) return res.redirect("/store");
  
  const user = await UserService.getUserByUsername(username);

  // if no user found for the username
  if (!user) return res.status(404).json("User not found");
  let store = await StoreService.getStoreByUserId(user.id);

  if (!store) return res.status(404).json("Store not found");

  let products = []
  if (store) {
    console.log (store);
     products = await productController.get_store_products(store.id);

    return res.render("store", { store: store, user: user, products:products, isStoreOwner: false });
  }

  res.render("store", { store: store, user: user, isStoreOwner: false });
};

const upload_photo = parser.single("bannerPic");

const edit_mystore = async (req, res) => {
  var updatedStore = { ...req.body };
  if (req.file) updatedStore.storePhoto = req.file?.path;
  else console.log("No file uploaded");

  console.log(updatedStore);
  try {
    await StoreService.createOrUpdateStore(req.user.id, updatedStore);
  } catch (e) {
    res.json(e);
  }
  res.redirect("/profile/me");
};

//  called when a user adds a product to their store
const add_product_to_store = async (req, res) => {
  const productId = req.params.id;
  const storeId = req.user.id;
  await StoreService.addProductToStore(storeId, productId);
  res.redirect("/store");
};

const remove_product_from_store = async (req, res) => {
  const productId = req.params.id;
  const storeId = req.user.id;
  await StoreService.removeProductFromStore(storeId, productId);
  res.redirect("/store");
};


//  export the module
module.exports = {
  get_mystore,
  get_store,
  upload_photo,
  edit_mystore,
  add_product_to_store
};
