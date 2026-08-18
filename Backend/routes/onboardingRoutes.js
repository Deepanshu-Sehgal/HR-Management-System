const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboardingController");

router.post("/", onboardingController.createOnboarding);
router.get("/", onboardingController.getOnboardings);
router.get("/stats", onboardingController.getStats);
router.get("/:id", onboardingController.getOnboardingById);
router.post("/:id/tasks", onboardingController.addTask);
router.patch("/:id/tasks/:taskId", onboardingController.updateTaskStatus);
router.delete("/:id", onboardingController.deleteOnboarding);

module.exports = router;
