const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const payrollController = require("../controllers/payrollController");

router.post("/", authMiddleware, authorize("admin", "hr"), payrollController.createPayroll);
router.get("/", authMiddleware, authorize("admin", "hr"), payrollController.getAllPayrolls);
router.get("/employee/:employeeId", authMiddleware, payrollController.getPayrollByEmployeeId);
router.get("/month/:month/:year", authMiddleware, authorize("admin", "hr"), payrollController.getPayrollByMonthYear);
router.get("/analytics", authMiddleware, authorize("admin", "hr"), payrollController.getPayrollAnalytics);
router.put("/:id", authMiddleware, authorize("admin", "hr"), payrollController.updatePayroll);
router.patch("/:id/process", authMiddleware, authorize("admin", "hr"), payrollController.processPayroll);
router.delete("/:id", authMiddleware, authorize("admin", "hr"), payrollController.deletePayroll);

module.exports = router;
