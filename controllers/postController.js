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
    res.render("viewPost", { post: post, user: user, title: "Post" });
};

// Function Called from Profile Controller
const addUserPost = async (post) => {
    PostService.addPost(post)
};
const makePost = async (req, res) => {
    var post = {
        userId: req.user.id,
        title: req.body.title,
        content: req.body.description,
    };
    console.log(req.body)
    await PostService.addPost(post)
    res.redirect("/profile/me");
};

const get_makePost = async (req, res) => {
    res.render("addPost", { title: "Add Post" });
};

module.exports = {
    get_userposts,
    addUserPost,
    get_product,
    makePost,
    get_makePost
}