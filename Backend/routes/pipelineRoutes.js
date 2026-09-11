const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const pipelineController = require("../controllers/pipelineController");
const aiLeadController = require("../controllers/aiLeadController");
const validate = require("../utils/validate");
const validateObjectId = require("../utils/validateObjectId");
const {
  createPipelineSchema,
  enrollSchema,
  moveStageSchema,
  addTaskSchema,
  updateMetaSchema,
} = require("../validators/pipelineValidators");

// Reject malformed Mongo ids (400) before they reach a controller/DB call.
router.param("id", validateObjectId("id"));
router.param("taskId", validateObjectId("taskId"));

// AI endpoints call OpenAI (cost + latency) — cap per-client usage. Configure
// with AI_RATE_LIMIT_MAX / AI_RATE_LIMIT_WINDOW_MINUTES.
const aiLimiter = rateLimit({
  windowMs:
    (process.env.AI_RATE_LIMIT_WINDOW_MINUTES
      ? parseInt(process.env.AI_RATE_LIMIT_WINDOW_MINUTES, 10)
      : 5) *
    60 *
    1000,
  max: process.env.AI_RATE_LIMIT_MAX ? parseInt(process.env.AI_RATE_LIMIT_MAX, 10) : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI requests. Please try again shortly." },
});

// Pipeline CRUD
router.post("/", validate(createPipelineSchema), pipelineController.createPipeline);
router.get("/", pipelineController.getPipelines);
router.get("/ensure-default", pipelineController.ensureDefaultPipeline);

// Automation & analytics that must resolve before the ":id" param routes
router.get("/overdue", pipelineController.getOverdue);
router.get("/tasks", pipelineController.getTasks);
router.post("/run-sla-sweep", pipelineController.triggerSlaSweep);

// Application movement within a pipeline
router.post("/enroll", validate(enrollSchema), pipelineController.enrollApplication);
router.patch(
  "/applications/:id/move",
  validate(moveStageSchema),
  pipelineController.moveStage
);
router.patch(
  "/applications/:id/meta",
  validate(updateMetaSchema),
  pipelineController.updateApplicationMeta
);
router.post("/applications/:id/activity", pipelineController.addActivity);

// Per-application task tracking
router.post("/applications/:id/tasks", validate(addTaskSchema), pipelineController.addTask);
router.patch("/applications/:id/tasks/:taskId", pipelineController.updateTask);
router.delete("/applications/:id/tasks/:taskId", pipelineController.deleteTask);

// AI lead management (rate-limited)
router.post("/applications/:id/ai-score", aiLimiter, aiLeadController.scoreLead);
router.post("/applications/:id/ai-email", aiLimiter, aiLeadController.draftLeadEmail);
router.post("/:id/ai-prioritize", aiLimiter, aiLeadController.prioritizeLeads);

// Pipeline-scoped views
router.get("/:id/board", pipelineController.getBoard);
router.get("/:id/funnel", pipelineController.getFunnel);
router.get("/:id", pipelineController.getPipelineById);
router.put("/:id", pipelineController.updatePipeline);
router.delete("/:id", pipelineController.deletePipeline);

module.exports = router;
