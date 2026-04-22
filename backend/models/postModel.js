const db = require("../db");

async function getAllPosts() {
  const [rows] = await db.query(
    `SELECT
      p.post_id,
      p.user_id,
      u.username,
      p.content,
      p.image_url,
      p.created_at,
      p.updated_at,
      COALESCE(l.like_count, 0) AS like_count,
      COALESCE(c.comment_count, 0) AS comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS like_count
      FROM likes
      GROUP BY post_id
    ) l ON p.post_id = l.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS comment_count
      FROM comments
      GROUP BY post_id
    ) c ON p.post_id = c.post_id
    ORDER BY p.created_at DESC`
  );
  return rows;
}

async function getPostById(id) {
  const [rows] = await db.query(
    `SELECT
      p.post_id,
      p.user_id,
      u.username,
      p.content,
      p.image_url,
      p.created_at,
      p.updated_at,
      COALESCE(l.like_count, 0) AS like_count,
      COALESCE(c.comment_count, 0) AS comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS like_count
      FROM likes
      GROUP BY post_id
    ) l ON p.post_id = l.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS comment_count
      FROM comments
      GROUP BY post_id
    ) c ON p.post_id = c.post_id
    WHERE p.post_id = ?`,
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

async function getFeed(userId, limit, offset) {
  const [rows] = await db.query(
    `SELECT
      p.post_id,
      p.user_id,
      u.username,
      p.content,
      p.image_url,
      p.created_at,
      p.updated_at,
      COALESCE(l.like_count, 0) AS like_count,
      COALESCE(c.comment_count, 0) AS comment_count,
      EXISTS(
        SELECT 1
        FROM likes l2
        WHERE l2.post_id = p.post_id AND l2.user_id = ?
      ) AS liked_by_me
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS like_count
      FROM likes
      GROUP BY post_id
    ) l ON p.post_id = l.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS comment_count
      FROM comments
      GROUP BY post_id
    ) c ON p.post_id = c.post_id
    WHERE p.user_id = ?
      OR p.user_id IN (
        SELECT followed_user_id
        FROM followers
        WHERE follower_user_id = ?
      )
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?`,
    [userId, userId, userId, limit, offset]
  );
  return rows;
}

module.exports = { getAllPosts, getPostById, createPost, getFeed };
