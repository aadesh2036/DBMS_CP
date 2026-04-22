const db = require("../db");

async function findUserByIdentifier(identifier) {
  const [rows] = await db.query(
    "SELECT user_id, username, email, password_hash, full_name, role FROM users WHERE email = ? OR username = ? LIMIT 1",
    [identifier, identifier]
  );
  return rows[0];
}

async function createUser({ username, email, password_hash, full_name }) {
  const [result] = await db.query(
    "INSERT INTO users (username, email, password_hash, full_name, created_at, last_login) VALUES (?, ?, ?, ?, NOW(), NOW())",
    [username, email, password_hash, full_name || null]
  );
  const [rows] = await db.query(
    "SELECT user_id, username, email, full_name, role FROM users WHERE user_id = ?",
    [result.insertId]
  );
  return rows[0];
}

async function updateLastLogin(userId) {
  await db.query("UPDATE users SET last_login = NOW() WHERE user_id = ?", [
    userId,
  ]);
}

module.exports = { findUserByIdentifier, createUser, updateLastLogin };
