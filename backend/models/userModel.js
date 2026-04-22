const db = require("../db");

async function getAllUsers() {
  const [rows] = await db.query(
    "SELECT user_id, username, full_name, email, bio, profile_picture_url, created_at, last_login FROM users ORDER BY user_id"
  );
  return rows;
}

async function getUserById(id) {
  const [rows] = await db.query(
    "SELECT user_id, username, full_name, email, bio, profile_picture_url, created_at, last_login FROM users WHERE user_id = ?",
    [id]
  );
  return rows[0];
}

module.exports = { getAllUsers, getUserById };
