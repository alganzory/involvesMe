const ProductService = require("../models/product-Model");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const e = require("express");

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




const edit_product = async (req, res) => {
    console.log('this is editing page')
    var updatedProduct = { ...req.body };
    //check if the photos are changed or not 
    if (req.file) {
        const productPhotos=[];
        for(let index =0; index< req.file.length; index++){
            updatedProduct.productPhotos[index]=req.file?.path;
        }
      
    }else{
         console.log("No file uploaded");
    }
    console.log(updatedProduct);
  

    try{
        await ProductService.updateProduct(req.user.id, updatedProduct);
    }catch(e){
        res.json(e);
    }
    res.redirect("/product/");

  };



//   delete products by user id
const delete_product = async(req, res)=>{
    console.log('this is delete')
    // var delete_product = req.body;
    var delete_userid = req.user.id;
    await ProductService.deleteProduct(delete_userid)
    console.log('deleted')
    res.redirect("/product/");
    
}


  module.exports = {
    edit_product,
    delete_product,
    upload_photos,
    

  };
  