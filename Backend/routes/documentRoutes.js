const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");

router.post("/", documentController.createDocument);
router.get("/", documentController.getAllDocuments);
router.get("/type/:type", documentController.getDocumentsByType);
router.get("/search", documentController.searchDocuments);
router.get("/:id", documentController.getDocumentById);
router.put("/:id", documentController.updateDocument);
router.patch("/:id/deactivate", documentController.deactivateDocument);
router.delete("/:id", documentController.deleteDocument);

module.exports = router;
