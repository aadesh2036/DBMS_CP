const analyticsModel = require("../models/analyticsModel");

async function getTopUsers(req, res) {
  try {
    const rows = await analyticsModel.getTopUsers();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top users" });
  }
}

async function getTopPosts(req, res) {
  try {
    const rows = await analyticsModel.getTopPosts();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top posts" });
  }
}

async function getEngagement(req, res) {
  try {
    const rows = await analyticsModel.getEngagement();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch engagement" });
  }
}

async function getUserActivity(req, res) {
  try {
    const rows = await analyticsModel.getUserActivity();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user activity" });
  }
}

async function getEngagementReport(req, res) {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "start and end dates are required" });
    }
    const startAt = `${start} 00:00:00`;
    const endAt = `${end} 23:59:59`;
    const rows = await analyticsModel.getEngagementReport(startAt, endAt);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch engagement report" });
  }
}

module.exports = {
  getTopUsers,
  getTopPosts,
  getEngagement,
  getUserActivity,
  getEngagementReport,
};
