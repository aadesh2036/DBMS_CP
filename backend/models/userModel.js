const db = require("../db");

async function getAllUsers() {
  const [rows] = await db.query(
    "SELECT id, username, full_name, email, bio, created_at FROM users ORDER BY id"
  );
  return rows;
}

async function getUserById(id) {
  const [rows] = await db.query(
    "SELECT id, username, full_name, email, bio, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0];
}

module.exports = { getAllUsers, getUserById };
