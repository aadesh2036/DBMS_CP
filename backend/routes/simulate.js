const express = require("express");
const router = express.Router();
const simulateController = require("../controllers/simulateController");

router.post("/simulate-data", simulateController.simulateData);

module.exports = router;
