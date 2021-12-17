const ProductService = require("../models/product-Model");
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
    folder: "product-photos",
    use_filename: false,
    allowedFormats: ["jpg", "png", "jpeg"],
  },
});

const parser = multer({ storage: storage });

const get_addproduct = async (req, res) => {
    res.render('addProduct');
};

const upload_photos =  parser.array('productPhotos', 10);


const add_product = async (req, res) => {
    var product = { ...req.body };
    console.log(req.files)
    product.userId = req.user.id;
    if (req.files){
        const productPhotos=[];
        for (let index = 0; index < req.files.length; index++) { //for loop to assign each url to array and add the array as a whole to database
            productPhotos[index] = req.files[index].path;
        }
        product.productPhotos = productPhotos;
    }

    else console.log("No file uploaded");

    console.log(product);
    try {
        await ProductService.addProduct(product);
    } catch (e) {
        res.json(e);
    }
    res.redirect("/");
};


module.exports = {
    add_product,
    upload_photos,
    get_addproduct
};
