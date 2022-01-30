const ProductService = require("../models/product-model");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const uuid = require("uuid");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "product-photos",
        use_filename: false,
        allowedFormats: ["jpg", "png", "jpeg"],
    },
});

const parser = multer({ storage: storage });

const get_addproduct = async(req, res) => {
    res.render('addProduct',{usertype: req.user.type});
};

const upload_photos = parser.array('productPhotos', 10);


const add_product = async(req, res) => {
    var product = {...req.body };
    console.log(req.files)
    product.storeId = req.user.id;
    product.id = uuid.v4();
    if (req.files) {
        const productPhotos = [];
        for (let index = 0; index < req.files.length; index++) { //for loop to assign each url to array and add the array as a whole to database
            productPhotos[index] = req.files[index].path;
        }
        product.productPhotos = productPhotos;
    } else console.log("No file uploaded");

    console.log(product);
    try {
        await ProductService.addProduct(product);
    } catch (e) {
        res.json(e);
    }
    res.redirect("/");
};

const get_product = async(req, res) => {
    const productId = req.params.id;
    const product = await ProductService.getProductById(productId);

    console.log(product);

    // extract some user info from req.user object
    const user = {
        id: req.user.id,
        type: req.user.type,
        username: req.user.username,
    };


    res.render("viewProduct", { product: product, usertype: req.user.type,user: user });
};

const get_product_json = async(req, res) => {
    const productId = req.params.id;
    const product = await ProductService.getProductById(productId);
    res.json(product);
};

const updateProductStock = async(productObject, productId) => {
    var updatedProduct = await ProductService.updateProduct(productId, productObject);
    return updatedProduct;
}

const isAvailableStock = async(stock, quantity) => {
    if (stock < quantity) {
        return false;
    } else {
        return true;
    }
};

const GetProductObject = async(productId) => {
    var product = await ProductService.getProductById(productId);
    return product;
};


module.exports = {
    get_product,
    get_product_json,
    updateProductStock,
    isAvailableStock,
    GetProductObject,
    add_product,
    upload_photos,
    get_addproduct
};