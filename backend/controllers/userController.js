const userModel = require("../models/userModel");

async function getUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function getUserById(req, res) {
  try {
    const user = await userModel.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

async function getFollowStats(req, res) {
  try {
    const stats = await userModel.getFollowStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch follow stats" });
  }
}

async function getFollowing(req, res) {
  try {
    const rows = await userModel.getFollowing(req.params.id);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch following list" });
  }
}

async function getFollowers(req, res) {
  try {
    const rows = await userModel.getFollowers(req.params.id);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch followers list" });
  }
}

module.exports = {
  getUsers,
  getUserById,
  getFollowStats,
  getFollowing,
  getFollowers,
};
