const express = require("express");
const router = express.Router();
const interactionController = require("../controllers/interactionController");

router.post("/like", interactionController.likePost);
router.post("/comment", interactionController.commentOnPost);
router.post("/follow", interactionController.followUser);

module.exports = router;
