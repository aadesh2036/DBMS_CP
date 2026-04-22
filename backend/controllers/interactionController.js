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
    const followerUserId = req.body.follower_user_id ?? req.body.follower_id;
    const followedUserId = req.body.followed_user_id ?? req.body.following_id;
    if (!followerUserId || !followedUserId) {
      return res
        .status(400)
        .json({
          error:
            "follower_user_id (or follower_id) and followed_user_id (or following_id) are required",
        });
    }
    if (Number(followerUserId) === Number(followedUserId)) {
      return res
        .status(400)
        .json({ error: "follower_user_id cannot equal followed_user_id" });
    }
    const result = await interactionModel.addFollow(
      followerUserId,
      followedUserId
    );
    const inserted = result.affectedRows > 0;
    res.json({ message: inserted ? "Followed user" : "Already following" });
  } catch (error) {
    res.status(500).json({ error: "Failed to follow user" });
  }
}

module.exports = { likePost, commentOnPost, followUser };
