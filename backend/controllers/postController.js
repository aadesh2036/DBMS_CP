const postModel = require("../models/postModel");

async function getPosts(req, res) {
  try {
    const posts = await postModel.getAllPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}

async function getPostById(req, res) {
  try {
    const post = await postModel.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
}

async function createPost(req, res) {
  try {
    const { user_id, content } = req.body;
    if (!user_id || !content) {
      return res.status(400).json({ error: "user_id and content are required" });
    }
    const newPostId = await postModel.createPost(user_id, content);
    const newPost = await postModel.getPostById(newPostId);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
}

module.exports = { getPosts, getPostById, createPost };
