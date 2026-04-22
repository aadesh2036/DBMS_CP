const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getUsers);
router.get("/:id/follow-stats", userController.getFollowStats);
router.get("/:id/following", userController.getFollowing);
router.get("/:id/followers", userController.getFollowers);
router.get("/:id", userController.getUserById);

module.exports = router;
