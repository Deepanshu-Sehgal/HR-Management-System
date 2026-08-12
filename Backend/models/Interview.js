const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    // The pipeline application this interview belongs to.
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
    },
    pipelineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pipeline",
      default: null,
    },
    // Denormalized for quick listing without populating the application.
    candidateName: { type: String, required: true, trim: true },
    jobTitle: { type: String, default: "" },
    email: { type: String, default: "" },

    scheduledAt: { type: Date, required: true },
    durationMins: { type: Number, default: 45, min: 5 },
    mode: {
      type: String,
      enum: ["Video", "Phone", "Onsite"],
      default: "Video",
    },
    // Meeting link (video/phone) or physical address (onsite).
    location: { type: String, default: "" },
    interviewer: { type: String, default: "" },
    // e.g. "Screening", "Technical Round 1", "HR Round"
    round: { type: String, default: "Interview" },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "No-show"],
      default: "Scheduled",
    },
    feedback: { type: String, default: "" },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

interviewSchema.index({ applicationId: 1, scheduledAt: 1 });
interviewSchema.index({ status: 1, scheduledAt: 1 });

const Interview = mongoose.model("Interview", interviewSchema);
module.exports = Interview;
