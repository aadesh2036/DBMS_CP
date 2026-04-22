const db = require("../db");

async function addLike(userId, postId) {
  const [result] = await db.query(
    "INSERT IGNORE INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)",
    [postId, userId, new Date()]
  );
  return result;
}

async function hasLike(userId, postId) {
  const [rows] = await db.query(
    "SELECT like_id FROM likes WHERE post_id = ? AND user_id = ? LIMIT 1",
    [postId, userId]
  );
  return rows[0];
}

async function removeLike(userId, postId) {
  const [result] = await db.query(
    "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
    [postId, userId]
  );
  return result;
}

async function getLikeCount(postId) {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS like_count FROM likes WHERE post_id = ?",
    [postId]
  );
  return rows[0]?.like_count || 0;
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
    "INSERT IGNORE INTO followers (follower_user_id, followed_user_id, created_at) VALUES (?, ?, ?)",
    [followerId, followingId, new Date()]
  );
  return result;
}

async function hasFollow(followerId, followingId) {
  const [rows] = await db.query(
    "SELECT follower_id FROM followers WHERE follower_user_id = ? AND followed_user_id = ? LIMIT 1",
    [followerId, followingId]
  );
  return rows[0];
}

async function removeFollow(followerId, followingId) {
  const [result] = await db.query(
    "DELETE FROM followers WHERE follower_user_id = ? AND followed_user_id = ?",
    [followerId, followingId]
  );
  return result;
}

module.exports = {
  addLike,
  hasLike,
  removeLike,
  getLikeCount,
  addComment,
  addFollow,
  hasFollow,
  removeFollow,
};
