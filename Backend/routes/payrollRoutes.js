const express = require("express");
const router = express.Router();
const payrollController = require("../controllers/payrollController");

router.post("/", payrollController.createPayroll);
router.get("/", payrollController.getAllPayrolls);
router.get("/employee/:employeeId", payrollController.getPayrollByEmployeeId);
router.get("/month/:month/:year", payrollController.getPayrollByMonthYear);
router.get("/analytics", payrollController.getPayrollAnalytics);
router.put("/:id", payrollController.updatePayroll);
router.patch("/:id/process", payrollController.processPayroll);
router.delete("/:id", payrollController.deletePayroll);

module.exports = router;
