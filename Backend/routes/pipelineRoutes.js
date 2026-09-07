const express = require("express");
const router = express.Router();
const pipelineController = require("../controllers/pipelineController");
const aiLeadController = require("../controllers/aiLeadController");

// Pipeline CRUD
router.post("/", pipelineController.createPipeline);
router.get("/", pipelineController.getPipelines);
router.get("/ensure-default", pipelineController.ensureDefaultPipeline);

// Automation & analytics that must resolve before the ":id" param routes
router.get("/overdue", pipelineController.getOverdue);
router.get("/tasks", pipelineController.getTasks);
router.post("/run-sla-sweep", pipelineController.triggerSlaSweep);

// Application movement within a pipeline
router.post("/enroll", pipelineController.enrollApplication);
router.patch("/applications/:id/move", pipelineController.moveStage);
router.post("/applications/:id/activity", pipelineController.addActivity);

// Per-application task tracking
router.post("/applications/:id/tasks", pipelineController.addTask);
router.patch("/applications/:id/tasks/:taskId", pipelineController.updateTask);
router.delete("/applications/:id/tasks/:taskId", pipelineController.deleteTask);

// AI lead management
router.post("/applications/:id/ai-score", aiLeadController.scoreLead);
router.post("/applications/:id/ai-email", aiLeadController.draftLeadEmail);
router.post("/:id/ai-prioritize", aiLeadController.prioritizeLeads);

// Pipeline-scoped views
router.get("/:id/board", pipelineController.getBoard);
router.get("/:id/funnel", pipelineController.getFunnel);
router.get("/:id", pipelineController.getPipelineById);
router.put("/:id", pipelineController.updatePipeline);
router.delete("/:id", pipelineController.deletePipeline);

module.exports = router;
