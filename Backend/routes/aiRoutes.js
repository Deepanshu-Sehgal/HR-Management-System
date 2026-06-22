const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.post("/announcement", aiController.generateAnnouncement);
router.post("/job-description", aiController.generateJobDescription);
router.post("/document-summary", aiController.summarizeText);

module.exports = router;
