const express = require("express");
const router = express.Router();
const performanceController = require("../controllers/performanceController");

router.post("/", performanceController.createPerformanceReview);
router.get("/", performanceController.getAllPerformanceReviews);
router.get("/employee/:employeeId", performanceController.getReviewsByEmployeeId);
router.get("/analytics", performanceController.getReviewAnalytics);
router.put("/:id", performanceController.updatePerformanceReview);
router.delete("/:id", performanceController.deletePerformanceReview);

module.exports = router;
