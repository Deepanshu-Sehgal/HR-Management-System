const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");

router.post("/", interviewController.createInterview);
router.get("/", interviewController.getInterviews);
router.get("/upcoming", interviewController.getUpcoming);
router.get("/application/:applicationId", interviewController.getInterviewsByApplication);
router.put("/:id", interviewController.updateInterview);
router.patch("/:id/cancel", interviewController.cancelInterview);
router.delete("/:id", interviewController.deleteInterview);

module.exports = router;
