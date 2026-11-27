const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const documentController = require("../controllers/documentController");

router.post("/", authMiddleware, authorize("admin", "hr"), documentController.createDocument);
router.get("/", authMiddleware, authorize("admin", "hr"), documentController.getAllDocuments);
router.get("/type/:type", authMiddleware, authorize("admin", "hr"), documentController.getDocumentsByType);
router.get("/search", authMiddleware, authorize("admin", "hr"), documentController.searchDocuments);
router.get("/expiring", authMiddleware, authorize("admin", "hr"), documentController.getExpiringDocuments);
router.get("/expiry-stats", authMiddleware, authorize("admin", "hr"), documentController.getExpiryStats);
router.post("/run-expiry-sweep", authMiddleware, authorize("admin", "hr"), documentController.runExpirySweep);
router.get("/:id", authMiddleware, authorize("admin", "hr"), documentController.getDocumentById);
router.put("/:id", authMiddleware, authorize("admin", "hr"), documentController.updateDocument);
router.post("/:id/send-reminder", authMiddleware, authorize("admin", "hr"), documentController.sendExpiryReminder);
router.patch("/:id/deactivate", authMiddleware, authorize("admin", "hr"), documentController.deactivateDocument);
router.delete("/:id", authMiddleware, authorize("admin", "hr"), documentController.deleteDocument);

module.exports = router;
