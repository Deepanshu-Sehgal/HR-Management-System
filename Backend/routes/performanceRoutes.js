const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const performanceController = require("../controllers/performanceController");

router.post("/", authMiddleware, authorize("admin", "hr"), performanceController.createPerformanceReview);
router.get("/", authMiddleware, authorize("admin", "hr", "employee"), performanceController.getAllPerformanceReviews);
router.get("/employee/:employeeId", authMiddleware, performanceController.getReviewsByEmployeeId);
router.get("/analytics", authMiddleware, authorize("admin", "hr"), performanceController.getReviewAnalytics);
router.put("/:id", authMiddleware, authorize("admin", "hr"), performanceController.updatePerformanceReview);
router.delete("/:id", authMiddleware, authorize("admin", "hr"), performanceController.deletePerformanceReview);

module.exports = router;
