const db = require("../db");

async function getAllUserIds(connection) {
  const [rows] = await connection.query("SELECT user_id FROM users");
  return rows.map((row) => row.user_id);
}

async function getAllPostIds(connection) {
  const [rows] = await connection.query("SELECT post_id FROM posts");
  return rows.map((row) => row.post_id);
}

async function insertUser(connection, data) {
  const [result] = await connection.query(
    "INSERT IGNORE INTO users (username, email, password_hash, full_name, bio, profile_picture_url, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      data.username,
      data.email,
      data.password_hash,
      data.full_name,
      data.bio,
      data.profile_picture_url,
      data.created_at,
      data.last_login,
    ]
  );
  return result;
}

async function insertPost(connection, userId, content, createdAt) {
  const [result] = await connection.query(
    "INSERT INTO posts (user_id, content, created_at) VALUES (?, ?, ?)",
    [userId, content, createdAt]
  );
  return result.insertId;
}

async function insertComment(connection, postId, userId, content, createdAt) {
  const [result] = await connection.query(
    "INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)",
    [postId, userId, content, createdAt]
  );
  return result;
}

async function insertLike(connection, postId, userId, createdAt) {
  const [result] = await connection.query(
    "INSERT IGNORE INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)",
    [postId, userId, createdAt]
  );
  return result;
}

async function insertFollow(connection, followerId, followingId, createdAt) {
  const [result] = await connection.query(
    "INSERT IGNORE INTO followers (follower_user_id, followed_user_id, created_at) VALUES (?, ?, ?)",
    [followerId, followingId, createdAt]
  );
  return result;
}

module.exports = {
  getAllUserIds,
  getAllPostIds,
  insertUser,
  insertPost,
  insertComment,
  insertLike,
  insertFollow,
};
