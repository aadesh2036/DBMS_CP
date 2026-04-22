const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/audit-log", adminController.getAuditLog);

module.exports = router;
