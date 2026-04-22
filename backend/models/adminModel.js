const db = require("../db");

async function getAuditLog(limit) {
  const [rows] = await db.query(
    `SELECT
      l.log_id,
      l.event_type,
      l.entity_type,
      l.entity_id,
      l.actor_user_id,
      u.username,
      l.details,
      l.created_at
    FROM audit_log l
    LEFT JOIN users u ON l.actor_user_id = u.user_id
    ORDER BY l.created_at DESC
    LIMIT ?`,
    [limit]
  );
  return rows;
}

module.exports = { getAuditLog };
