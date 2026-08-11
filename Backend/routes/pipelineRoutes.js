const express = require("express");
const router = express.Router();
const pipelineController = require("../controllers/pipelineController");

// Pipeline CRUD
router.post("/", pipelineController.createPipeline);
router.get("/", pipelineController.getPipelines);
router.get("/ensure-default", pipelineController.ensureDefaultPipeline);

// Automation & analytics that must resolve before the ":id" param routes
router.get("/overdue", pipelineController.getOverdue);
router.post("/run-sla-sweep", pipelineController.triggerSlaSweep);

// Application movement within a pipeline
router.post("/enroll", pipelineController.enrollApplication);
router.patch("/applications/:id/move", pipelineController.moveStage);
router.post("/applications/:id/activity", pipelineController.addActivity);

// Pipeline-scoped views
router.get("/:id/board", pipelineController.getBoard);
router.get("/:id/funnel", pipelineController.getFunnel);
router.get("/:id", pipelineController.getPipelineById);
router.put("/:id", pipelineController.updatePipeline);
router.delete("/:id", pipelineController.deletePipeline);

module.exports = router;
