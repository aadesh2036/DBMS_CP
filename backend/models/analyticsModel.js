const db = require("../db");

async function getTopUsers() {
  const [rows] = await db.query(
    `SELECT
      u.user_id AS user_id,
      u.username,
      COUNT(f.follower_id) AS follower_count
    FROM users u
    LEFT JOIN followers f ON u.user_id = f.followed_user_id
    GROUP BY u.user_id, u.username
    ORDER BY follower_count DESC, u.username ASC
    LIMIT 5`
  );
  return rows;
}

async function getTopPosts() {
  const [rows] = await db.query(
    `SELECT
      p.post_id AS post_id,
      p.content,
      u.username,
      COUNT(l.like_id) AS like_count
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    LEFT JOIN likes l ON p.post_id = l.post_id
    GROUP BY p.post_id, p.content, u.username
    ORDER BY like_count DESC, p.post_id DESC
    LIMIT 5`
  );
  return rows;
}

async function getEngagement() {
  const [rows] = await db.query(
    `SELECT
      p.post_id AS post_id,
      p.content,
      u.username,
      COALESCE(l.like_count, 0) AS like_count,
      COALESCE(c.comment_count, 0) AS comment_count,
      COALESCE(l.like_count, 0) + COALESCE(c.comment_count, 0) AS engagement
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
    ORDER BY engagement DESC, p.post_id DESC`
  );
  return rows;
}

async function getUserActivity() {
  const [rows] = await db.query(
    `SELECT
      u.user_id AS user_id,
      u.username,
      COUNT(p.post_id) AS post_count
    FROM users u
    LEFT JOIN posts p ON u.user_id = p.user_id
    GROUP BY u.user_id, u.username
    ORDER BY post_count DESC, u.username ASC`
  );
  return rows;
}

async function getEngagementReport(startAt, endAt) {
  const [rows] = await db.query(
    `SELECT
      post_id,
      content,
      activity_date,
      SUM(like_count) AS like_count,
      SUM(comment_count) AS comment_count
    FROM (
      SELECT
        p.post_id,
        p.content,
        DATE(l.created_at) AS activity_date,
        COUNT(*) AS like_count,
        0 AS comment_count
      FROM posts p
      JOIN likes l ON p.post_id = l.post_id
      WHERE l.created_at BETWEEN ? AND ?
      GROUP BY p.post_id, activity_date
      UNION ALL
      SELECT
        p.post_id,
        p.content,
        DATE(c.created_at) AS activity_date,
        0 AS like_count,
        COUNT(*) AS comment_count
      FROM posts p
      JOIN comments c ON p.post_id = c.post_id
      WHERE c.created_at BETWEEN ? AND ?
      GROUP BY p.post_id, activity_date
    ) activity
    GROUP BY post_id, content, activity_date
    ORDER BY activity_date DESC, post_id DESC`,
    [startAt, endAt, startAt, endAt]
  );
  return rows;
}

module.exports = {
  getTopUsers,
  getTopPosts,
  getEngagement,
  getUserActivity,
  getEngagementReport,
};
