const db = require("../db");

async function getAllPosts() {
  const [rows] = await db.query(
    `SELECT
      p.id,
      p.user_id,
      u.username,
      p.content,
      p.created_at,
      COALESCE(l.like_count, 0) AS like_count,
      COALESCE(c.comment_count, 0) AS comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS like_count
      FROM likes
      GROUP BY post_id
    ) l ON p.id = l.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS comment_count
      FROM comments
      GROUP BY post_id
    ) c ON p.id = c.post_id
    ORDER BY p.created_at DESC`
  );
  return rows;
}

async function getPostById(id) {
  const [rows] = await db.query(
    `SELECT
      p.id,
      p.user_id,
      u.username,
      p.content,
      p.created_at,
      COALESCE(l.like_count, 0) AS like_count,
      COALESCE(c.comment_count, 0) AS comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS like_count
      FROM likes
      GROUP BY post_id
    ) l ON p.id = l.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS comment_count
      FROM comments
      GROUP BY post_id
    ) c ON p.id = c.post_id
    WHERE p.id = ?`,
    [id]
  );
  return rows[0];
}

async function createPost(userId, content) {
  const [result] = await db.query(
    "INSERT INTO posts (user_id, content, created_at) VALUES (?, ?, ?)",
    [userId, content, new Date()]
  );
  return result.insertId;
}

module.exports = { getAllPosts, getPostById, createPost };
