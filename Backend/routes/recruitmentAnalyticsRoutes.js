const express = require("express");
const router = express.Router();
const controller = require("../controllers/recruitmentAnalyticsController");

router.get("/overview", controller.getOverview);

module.exports = router;
