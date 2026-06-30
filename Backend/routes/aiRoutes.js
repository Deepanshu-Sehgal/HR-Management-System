const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const aiController = require("../controllers/aiController");

router.post("/announcement", authMiddleware, aiController.generateAnnouncement);
router.post("/job-description", authMiddleware, aiController.generateJobDescription);
router.post("/document-summary", authMiddleware, aiController.summarizeText);

module.exports = router;
