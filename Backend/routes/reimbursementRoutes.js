const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const reimbursementController = require("../controllers/reimbursementController");

router.post(
  "/",
  authMiddleware,
  authorize("admin", "hr", "employee"),
  reimbursementController.createReimbursement
);
router.get(
  "/",
  authMiddleware,
  authorize("admin", "hr"),
  reimbursementController.getAllReimbursements
);
router.get(
  "/employee/:employeeId",
  authMiddleware,
  reimbursementController.getReimbursementsByEmployeeId
);
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "hr"),
  reimbursementController.updateReimbursement
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin", "hr"),
  reimbursementController.deleteReimbursement
);
router.get(
  "/summary",
  authMiddleware,
  authorize("admin", "hr"),
  reimbursementController.getReimbursementSummary
);

module.exports = router;
