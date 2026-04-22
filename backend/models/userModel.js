const db = require("../db");

async function getAllUsers() {
  const [rows] = await db.query(
    "SELECT user_id, username, full_name, email, bio, profile_picture_url, created_at, last_login, role FROM users ORDER BY user_id"
  );
  return rows;
}

async function getUserById(id) {
  const [rows] = await db.query(
    "SELECT user_id, username, full_name, email, bio, profile_picture_url, created_at, last_login, role FROM users WHERE user_id = ?",
    [id]
  );
  return rows[0];
}

async function getFollowStats(id) {
  const [rows] = await db.query(
    "SELECT follower_count, following_count FROM user_follow_stats WHERE user_id = ?",
    [id]
  );
  return rows[0] || { follower_count: 0, following_count: 0 };
}

async function getFollowing(id) {
  const [rows] = await db.query(
    `SELECT
      u.user_id,
      u.username,
      u.full_name,
      u.profile_picture_url
    FROM followers f
    JOIN users u ON f.followed_user_id = u.user_id
    WHERE f.follower_user_id = ?
    ORDER BY u.username`,
    [id]
  );
  return rows;
}

async function getFollowers(id) {
  const [rows] = await db.query(
    `SELECT
      u.user_id,
      u.username,
      u.full_name,
      u.profile_picture_url
    FROM followers f
    JOIN users u ON f.follower_user_id = u.user_id
    WHERE f.followed_user_id = ?
    ORDER BY u.username`,
    [id]
  );
  return rows;
}

module.exports = {
  getAllUsers,
  getUserById,
  getFollowStats,
  getFollowing,
  getFollowers,
};
