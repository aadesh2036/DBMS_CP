const postModel = require("../models/postModel");

async function getFeed(req, res) {
  try {
    const userId = Number(req.query.user_id);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 40);

    if (!userId) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const offset = (page - 1) * limit;
    const rows = await postModel.getFeed(userId, limit + 1, offset);
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return res.json({ page, limit, hasMore, items });
  } catch (error) {
    return res.status(500).json({ error: "Failed to load feed" });
  }
}

module.exports = { getFeed };
