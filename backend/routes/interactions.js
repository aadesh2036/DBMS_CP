const express = require("express");
const router = express.Router();
const interactionController = require("../controllers/interactionController");

router.post("/like", interactionController.likePost);
router.post("/like-toggle", interactionController.toggleLike);
router.post("/comment", interactionController.commentOnPost);
router.post("/follow", interactionController.followUser);
router.post("/follow-toggle", interactionController.toggleFollow);

module.exports = router;
