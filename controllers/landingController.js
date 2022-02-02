const PostService = require("../models/post-Model");
const ProfileService = require("../models/profile-Model");
const ProductService = require('../models/product-model')
// get all profiles that are not of the currently logged in user
const get_all_other_profiles = async (req) => {
  try {
    const profiles = await ProfileService.getAllOtherProfiles(req.user.id);
    console.log(profiles);
    return profiles;
  } catch (err) {
    console.log(error);
  }
};

const get_all_other_posts = async (req) => {
    try {
        const posts = await PostService.getAllOtherPosts(req.user.id);
        console.log(posts);
        return posts;
    } catch (err) {
        console.log(error);
    }
};

const get_all_other_products = async (req) => {
    try {
        const products = await ProductService.getAllOtherProducts(req.user.id);
        console.log(products);
        return products;
    } catch (err) {
        console.log(error);
    }
};

const get_landing_page = async (req,res) => {
    try {
        const profiles = await get_all_other_profiles(req);
        const posts = await get_all_other_posts(req);
        const products = await get_all_other_products(req);
        return res.render('landing', {
            profiles: profiles,
            posts: posts,
            products: products,
            usertype: req.user.type
        });
    } catch (err) {
        console.log(err);
    }
};


module.exports = {
    get_landing_page
};