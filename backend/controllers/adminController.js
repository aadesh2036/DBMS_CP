const adminModel = require("../models/adminModel");

async function getAuditLog(req, res) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const rows = await adminModel.getAuditLog(limit);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch audit log" });
  }
}

module.exports = { getAuditLog };
