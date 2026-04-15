const db = require("../db");

async function getAllUserIds(connection) {
  const [rows] = await connection.query("SELECT id FROM users");
  return rows.map((row) => row.id);
}

async function getAllPostIds(connection) {
  const [rows] = await connection.query("SELECT id FROM posts");
  return rows.map((row) => row.id);
}

async function insertUser(connection, data) {
  const [result] = await connection.query(
    "INSERT IGNORE INTO users (username, full_name, email, bio, created_at) VALUES (?, ?, ?, ?, ?)",
    [data.username, data.full_name, data.email, data.bio, data.created_at]
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
    "INSERT IGNORE INTO followers (follower_id, following_id, created_at) VALUES (?, ?, ?)",
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
