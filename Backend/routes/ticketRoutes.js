const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");

router.post("/", ticketController.createTicket);
router.get("/", ticketController.getTickets);
router.get("/stats", ticketController.getStats);
router.get("/:id", ticketController.getTicketById);
router.put("/:id", ticketController.updateTicket);
router.post("/:id/comments", ticketController.addComment);
router.delete("/:id", ticketController.deleteTicket);

module.exports = router;
