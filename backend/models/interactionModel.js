const db = require("../db");

async function addLike(userId, postId) {
  const [result] = await db.query(
    "INSERT IGNORE INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)",
    [postId, userId, new Date()]
  );
  return result;
}

async function addComment(userId, postId, content) {
  const [result] = await db.query(
    "INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)",
    [postId, userId, content, new Date()]
  );
  return result;
}

async function addFollow(followerId, followingId) {
  const [result] = await db.query(
    "INSERT IGNORE INTO followers (follower_id, following_id, created_at) VALUES (?, ?, ?)",
    [followerId, followingId, new Date()]
  );
  return result;
}

module.exports = { addLike, addComment, addFollow };
