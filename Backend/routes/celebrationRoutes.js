const express = require("express");
const router = express.Router();
const celebrationController = require("../controllers/celebrationController");

router.get("/upcoming", celebrationController.getUpcoming);
router.get("/log", celebrationController.getLog);
router.post("/send", celebrationController.sendGreeting);
router.post("/run-sweep", celebrationController.runSweep);

module.exports = router;
