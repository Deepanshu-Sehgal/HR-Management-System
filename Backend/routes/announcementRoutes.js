const express = require("express");
const router = express.Router();
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const announcementController = require("../controllers/announcementController");

router.post(
  "/",
  authMiddleware,
  authorize("admin", "hr"),
  announcementController.createAnnouncement
);
router.get("/", authMiddleware, announcementController.getAllAnnouncements);
router.get("/active", authMiddleware, announcementController.getActiveAnnouncements);
router.get("/:id", authMiddleware, announcementController.getAnnouncementById);
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "hr"),
  announcementController.updateAnnouncement
);
router.patch(
  "/:id/deactivate",
  authMiddleware,
  authorize("admin", "hr"),
  announcementController.deactivateAnnouncement
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin", "hr"),
  announcementController.deleteAnnouncement
);

module.exports = router;
