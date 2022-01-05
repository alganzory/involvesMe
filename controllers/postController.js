const PostService = require("../models/post-Model");

const get_userposts = async (id) => {
    var posts = await PostService.getPostByuserId(id)
    return posts;
};

const get_product = async (req, res) => {
    const postId = req.params.id;
    const post = await PostService.getPostById(postId);
    
    console.log(post)
    var user = {
        id: req.user.id
    }
    res.render("viewPost", { post: post,user: user,title: "Post"});
  };

const addUserPost = async (post) => {
    PostService.addPost(post)
};



module.exports = {
    get_userposts,
    addUserPost,
    get_product
}