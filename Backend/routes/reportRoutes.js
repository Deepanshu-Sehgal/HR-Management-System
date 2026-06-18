const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.post("/", reportController.createReport);
router.get("/", reportController.getAllReports);
router.get("/type/:type", reportController.getReportsByType);
router.get("/overview", reportController.getAnalyticsOverview);
router.get("/:id", reportController.getReportById);
router.put("/:id", reportController.updateReport);
router.delete("/:id", reportController.deleteReport);

module.exports = router;
