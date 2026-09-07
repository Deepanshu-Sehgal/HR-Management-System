const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const policyController = require("../controllers/policyController");

router.post(
  "/",
  authMiddleware,
  authorize("admin", "hr"),
  policyController.createPolicy
);
router.get(
  "/",
  authMiddleware,
  policyController.getAllPolicies
);
router.get(
  "/:id",
  authMiddleware,
  policyController.getPolicyById
);
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "hr"),
  policyController.updatePolicy
);
router.patch(
  "/:id/deactivate",
  authMiddleware,
  authorize("admin", "hr"),
  policyController.deactivatePolicy
);
router.post(
  "/:id/acknowledge",
  authMiddleware,
  policyController.acknowledgePolicy
);
router.get(
  "/:id/acknowledgements",
  authMiddleware,
  authorize("admin", "hr"),
  policyController.getPolicyAcknowledgements
);
router.get(
  "/employee/:employeeId/acknowledgements",
  authMiddleware,
  policyController.getEmployeeAcknowledgements
);

module.exports = router;
