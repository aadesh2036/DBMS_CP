const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");

router.get("/top-users", analyticsController.getTopUsers);
router.get("/top-posts", analyticsController.getTopPosts);
router.get("/engagement", analyticsController.getEngagement);
router.get("/user-activity", analyticsController.getUserActivity);

module.exports = router;
