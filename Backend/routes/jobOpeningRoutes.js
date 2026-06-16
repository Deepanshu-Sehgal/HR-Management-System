const express = require("express");
const router = express.Router();
const jobOpeningController = require("../controllers/jobOpeningController");

router.post("/", jobOpeningController.createJobOpening);
router.get("/", jobOpeningController.getAllJobOpenings);
router.get("/active", jobOpeningController.getActiveJobOpenings);
router.get("/:id", jobOpeningController.getJobOpeningById);
router.put("/:id", jobOpeningController.updateJobOpening);
router.patch("/:id/close", jobOpeningController.closeJobOpening);
router.delete("/:id", jobOpeningController.deleteJobOpening);

module.exports = router;
