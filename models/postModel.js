let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const postSchema = new Schema({
  userId: {
    type: String,
    default: null,
  },
  id: String,
  Photo: String,
  title: String,
  content: String,
  type: String
}, { timestamps: true });
const Post = mongoose.model("post", postSchema, "post");

exports.postModel = Post;

exports.addPost = async (post) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const newPost = new Post(post);
    await newPost.save();
    return newPost;
  } catch (error) {
    console.error(error);
  }
};

exports.getPostByuserId = async (userId) => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      var Posts = await Post.find({ userId });
      return Posts;
    } catch (error) {
      console.error(error);
    }
};

exports.getPostById = async (id) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    return await Post.findOne({ _id: id });
  } catch (error) {
    console.error(error);
  }
};

exports.updatePost = async (id, post) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedPost = await Post.updateOne({ _id: id }, post);
    return updatedPost;
  } catch (error) {
    throw error;
  }
};

exports.deletePost = async (id) => {
 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const updatedPost = await Post.deleteOne({ _id: id });
    return updatedPost;
  } catch (error) {
    throw error;
  }
};

exports.getAllOtherPosts = async (userId) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const posts = await Post.find({ userId: { $ne: userId } });
    return posts;
  } catch (error) {
    console.error(error);
  }
};