const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const subscriptionController = require("../controllers/subscriptionController");

router.get("/plans", subscriptionController.getPlans);
router.post("/plans", authMiddleware, subscriptionController.createPlan);
router.post("/subscribe", authMiddleware, subscriptionController.subscribeUser);
router.get("/me", authMiddleware, subscriptionController.getSubscription);
router.post("/cancel", authMiddleware, subscriptionController.cancelSubscription);

module.exports = router;
