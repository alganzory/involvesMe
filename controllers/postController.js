const PostService = require("../models/post-Model");

const get_userposts = async (id) => {
    var posts = await PostService.getPostByuserId(id)
    return posts;
};

const addUserPost = async (post) => {
    PostService.addPost(post)
};



module.exports = {
    get_userposts,
    addUserPost
}