const express = require("express");
const router = express.Router();
const attendanceAnalyticsController = require("../controllers/attendanceAnalyticsController");

router.post("/", attendanceAnalyticsController.createAttendanceAnalytics);
router.get("/", attendanceAnalyticsController.getAllAttendanceAnalytics);
router.get("/employee/:employeeId", attendanceAnalyticsController.getAnalyticsByEmployeeId);
router.get("/month/:month/:year", attendanceAnalyticsController.getAnalyticsByMonthYear);
router.get("/summary", attendanceAnalyticsController.getAttendanceSummary);
router.put("/:id", attendanceAnalyticsController.updateAttendanceAnalytics);
router.delete("/:id", attendanceAnalyticsController.deleteAttendanceAnalytics);

module.exports = router;
