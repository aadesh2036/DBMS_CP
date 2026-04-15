const interactionModel = require("../models/interactionModel");

async function likePost(req, res) {
  try {
    const { user_id, post_id } = req.body;
    if (!user_id || !post_id) {
      return res.status(400).json({ error: "user_id and post_id are required" });
    }
    const result = await interactionModel.addLike(user_id, post_id);
    const inserted = result.affectedRows > 0;
    res.json({ message: inserted ? "Like added" : "Like already exists" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add like" });
  }
}

async function commentOnPost(req, res) {
  try {
    const { user_id, post_id, content } = req.body;
    if (!user_id || !post_id || !content) {
      return res
        .status(400)
        .json({ error: "user_id, post_id, and content are required" });
    }
    await interactionModel.addComment(user_id, post_id, content);
    res.status(201).json({ message: "Comment added" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
}

async function followUser(req, res) {
  try {
    const { follower_id, following_id } = req.body;
    if (!follower_id || !following_id) {
      return res
        .status(400)
        .json({ error: "follower_id and following_id are required" });
    }
    if (Number(follower_id) === Number(following_id)) {
      return res
        .status(400)
        .json({ error: "follower_id cannot equal following_id" });
    }
    const result = await interactionModel.addFollow(follower_id, following_id);
    const inserted = result.affectedRows > 0;
    res.json({ message: inserted ? "Followed user" : "Already following" });
  } catch (error) {
    res.status(500).json({ error: "Failed to follow user" });
  }
}

module.exports = { likePost, commentOnPost, followUser };
