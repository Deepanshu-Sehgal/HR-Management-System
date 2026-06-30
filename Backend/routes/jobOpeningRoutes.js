const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const validate = require("../utils/validate");
const jobOpeningController = require("../controllers/jobOpeningController");
const { jobOpeningSchema, jobOpeningUpdateSchema } = require("../validators/jobOpeningValidators");

router.post(
  "/",
  authMiddleware,
  authorize("admin", "hr"),
  validate(jobOpeningSchema),
  jobOpeningController.createJobOpening
);
router.get("/", authMiddleware, jobOpeningController.getAllJobOpenings);
router.get("/active", authMiddleware, jobOpeningController.getActiveJobOpenings);
router.get("/:id", authMiddleware, jobOpeningController.getJobOpeningById);
router.get("/:id/match", authMiddleware, jobOpeningController.matchEmployees);
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "hr"),
  validate(jobOpeningUpdateSchema),
  jobOpeningController.updateJobOpening
);
router.patch(
  "/:id/close",
  authMiddleware,
  authorize("admin", "hr"),
  jobOpeningController.closeJobOpening
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin", "hr"),
  jobOpeningController.deleteJobOpening
);

module.exports = router;
