const express = require("express");
const router = express.Router();
const jobApplicationController = require("../controllers/jobApplicationController");

router.post("/", jobApplicationController.createJobApplication);
router.get("/", jobApplicationController.getAllJobApplications);
router.get("/job/:jobOpeningId", jobApplicationController.getApplicationsByJobOpeningId);
router.get("/analytics", jobApplicationController.getApplicationAnalytics);
router.put("/:id", jobApplicationController.updateApplicationStatus);
router.patch("/:id/offer", jobApplicationController.sendJobOffer);
router.patch("/:id/reject", jobApplicationController.rejectApplication);
router.delete("/:id", jobApplicationController.deleteJobApplication);

module.exports = router;
