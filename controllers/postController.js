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

// delete post
const deletePost = async(req, res)=>{

    //get post id
    const post_id = req.body.postId;
    console.log(post_id);

    
    // delete
    const deletePost = await PostService.deletePost(post_id);
    console.log(deletePost);


    res.redirect("/profile/")

}

// delete post
const editPost = async(req, res)=>{

    //get post id
    console.log("hhhhhh")
    const post_id = req.body.postId;
    console.log(post_id);

    const postTitle = req.body.newTitle;
    console.log(postTitle)
    
    const postContent = req.body.newContent;
    console.log(postContent)
    

    if(postTitle.length >0){
        var post ={

            userId: req.user.id,
            title: postTitle,
            content: postContent
        }

        const editPost = await PostService.updatePost(post_id, post)
        

    
        // console.log(editPost);
    }else{
        req.flash(
            'nonull',
            "The title of post cannot be null"
          );
    }



    res.redirect("/post/"+post_id)

}


module.exports = {
    get_userposts,
    addUserPost,
    get_product,
    deletePost,
    editPost,
    makePost,
    get_makePost
}