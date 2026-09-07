const mongoose = require("mongoose");

// Automation config attached to a single pipeline stage.
// When an application enters the stage, these rules fire automatically.
const stageAutomationSchema = new mongoose.Schema(
  {
    // Send an automated email to the candidate on entering this stage
    emailEnabled: { type: Boolean, default: false },
    emailSubject: { type: String, trim: true, default: "" },
    // Supports placeholders: {{candidateName}}, {{jobTitle}}, {{stage}}
    emailTemplate: { type: String, default: "" },
    // SLA: number of business days an application may sit in this stage
    // before it is flagged as overdue. 0 = no SLA.
    slaDays: { type: Number, default: 0, min: 0 },
    // If set, an overdue application is auto-moved to this stage key by the
    // SLA sweep (e.g. auto-reject stale offers). Empty = only flag, don't move.
    autoAdvanceTo: { type: String, default: "" },
  },
  { _id: false }
);

const stageSchema = new mongoose.Schema(
  {
    // Stable machine key used across the board (e.g. "screening")
    key: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    // active = candidate still in play, won = hired, lost = rejected/withdrawn
    category: {
      type: String,
      enum: ["active", "won", "lost"],
      default: "active",
    },
    color: { type: String, default: "#2563eb" },
    automation: { type: stageAutomationSchema, default: () => ({}) },
  },
  { _id: false }
);

const pipelineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    // Optional link to a specific job opening. Null = reusable/global pipeline.
    jobOpeningId: { type: String, default: null },
    stages: {
      type: [stageSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "A pipeline must have at least one stage.",
      },
    },
    isDefault: { type: Boolean, default: false },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

// Default recruitment stages used when seeding a first pipeline.
pipelineSchema.statics.defaultStages = function () {
  return [
    {
      key: "applied",
      name: "Applied",
      order: 0,
      category: "active",
      color: "#64748b",
      automation: {
        emailEnabled: true,
        emailSubject: "Application received - {{jobTitle}}",
        emailTemplate:
          "Hi {{candidateName}},\n\nThanks for applying for {{jobTitle}}. Our team is reviewing your application and will be in touch soon.",
        slaDays: 3,
      },
    },
    {
      key: "screening",
      name: "Screening",
      order: 1,
      category: "active",
      color: "#0ea5e9",
      automation: { slaDays: 4 },
    },
    {
      key: "interview",
      name: "Interview",
      order: 2,
      category: "active",
      color: "#8b5cf6",
      automation: {
        emailEnabled: true,
        emailSubject: "Interview stage - {{jobTitle}}",
        emailTemplate:
          "Hi {{candidateName}},\n\nGood news - you've advanced to the interview stage for {{jobTitle}}. We'll reach out shortly to schedule.",
        slaDays: 5,
      },
    },
    {
      key: "offer",
      name: "Offer",
      order: 3,
      category: "active",
      color: "#f59e0b",
      automation: {
        emailEnabled: true,
        emailSubject: "Your offer for {{jobTitle}}",
        emailTemplate:
          "Hi {{candidateName}},\n\nWe're excited to move forward with an offer for {{jobTitle}}. Details will follow separately.",
        slaDays: 7,
        autoAdvanceTo: "",
      },
    },
    {
      key: "hired",
      name: "Hired",
      order: 4,
      category: "won",
      color: "#16a34a",
      automation: {
        emailEnabled: true,
        emailSubject: "Welcome aboard - {{jobTitle}}",
        emailTemplate:
          "Hi {{candidateName}},\n\nWelcome to the team! We're thrilled to have you join us for the {{jobTitle}} role.",
      },
    },
    {
      key: "rejected",
      name: "Rejected",
      order: 5,
      category: "lost",
      color: "#dc2626",
      automation: {
        emailEnabled: true,
        emailSubject: "Update on your application - {{jobTitle}}",
        emailTemplate:
          "Hi {{candidateName}},\n\nThank you for your interest in {{jobTitle}}. After careful consideration we won't be moving forward at this time. We wish you the best.",
      },
    },
  ];
};

const Pipeline = mongoose.model("Pipeline", pipelineSchema);
module.exports = Pipeline;
