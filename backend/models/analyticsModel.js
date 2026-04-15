const db = require("../db");

async function getTopUsers() {
  const [rows] = await db.query(
    `SELECT
      u.id AS user_id,
      u.username,
      COUNT(f.follower_id) AS follower_count
    FROM users u
    LEFT JOIN followers f ON u.id = f.following_id
    GROUP BY u.id, u.username
    ORDER BY follower_count DESC, u.username ASC
    LIMIT 5`
  );
  return rows;
}

async function getTopPosts() {
  const [rows] = await db.query(
    `SELECT
      p.id AS post_id,
      p.content,
      u.username,
      COUNT(l.id) AS like_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    GROUP BY p.id, p.content, u.username
    ORDER BY like_count DESC, p.id DESC
    LIMIT 5`
  );
  return rows;
}

async function getEngagement() {
  const [rows] = await db.query(
    `SELECT
      p.id AS post_id,
      p.content,
      u.username,
      COALESCE(l.like_count, 0) AS like_count,
      COALESCE(c.comment_count, 0) AS comment_count,
      COALESCE(l.like_count, 0) + COALESCE(c.comment_count, 0) AS engagement
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
    ORDER BY engagement DESC, p.id DESC`
  );
  return rows;
}

async function getUserActivity() {
  const [rows] = await db.query(
    `SELECT
      u.id AS user_id,
      u.username,
      COUNT(p.id) AS post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.id, u.username
    ORDER BY post_count DESC, u.username ASC`
  );
  return rows;
}

module.exports = { getTopUsers, getTopPosts, getEngagement, getUserActivity };
