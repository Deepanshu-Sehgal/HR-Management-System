const express = require("express");
const router = express.Router();
const offerController = require("../controllers/offerController");

router.post("/", offerController.createOffer);
router.get("/", offerController.getOffers);
router.get("/stats", offerController.getStats);
router.post("/run-expiry-sweep", offerController.triggerExpirySweep);
router.get("/application/:applicationId", offerController.getOffersByApplication);
router.patch("/:id/send", offerController.sendOffer);
router.patch("/:id/respond", offerController.respondOffer);
router.put("/:id", offerController.updateOffer);
router.delete("/:id", offerController.deleteOffer);

module.exports = router;
