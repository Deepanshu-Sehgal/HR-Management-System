const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");

router.post("/", announcementController.createAnnouncement);
router.get("/", announcementController.getAllAnnouncements);
router.get("/active", announcementController.getActiveAnnouncements);
router.get("/:id", announcementController.getAnnouncementById);
router.put("/:id", announcementController.updateAnnouncement);
router.patch("/:id/deactivate", announcementController.deactivateAnnouncement);
router.delete("/:id", announcementController.deleteAnnouncement);

module.exports = router;
