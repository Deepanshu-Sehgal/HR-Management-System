const mongoose = require("mongoose");

const JobApplicationSchema = new mongoose.Schema({
  jobOpeningId: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  applicantName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  resume: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
  },
  experience: {
    type: String,
  },
  qualifications: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Applied", "Shortlisted", "Interview", "Offered", "Rejected", "Hired"],
    default: "Applied",
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  interviewDate: {
    type: Date,
  },
  interviewFeedback: {
    type: String,
  },
  offerStatus: {
    type: String,
    enum: ["None", "Pending", "Accepted", "Rejected"],
    default: "None",
  },
  remarks: {
    type: String,
  },

  // ----- Pipeline (ATS) fields -----
  // Reference to the Pipeline this application is enrolled in.
  pipelineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pipeline",
    default: null,
  },
  // Current stage key within the pipeline (matches Pipeline.stages[].key).
  stageKey: {
    type: String,
    default: null,
  },
  // When the application entered its current stage (used for time-in-stage).
  stageEnteredAt: {
    type: Date,
  },
  // SLA deadline for the current stage; overdue when now > dueAt.
  dueAt: {
    type: Date,
    default: null,
  },
  // Recruiter / HR owner responsible for this application.
  assignedTo: {
    type: String,
    default: "",
  },
  tags: {
    type: [String],
    default: [],
  },
  // Ordered log of stage transitions.
  stageHistory: [
    {
      fromStage: { type: String },
      toStage: { type: String },
      movedAt: { type: Date, default: Date.now },
      movedBy: { type: String, default: "" },
      note: { type: String, default: "" },
      _id: false,
    },
  ],
  // Free-form activity timeline (comments, emails sent, system events).
  activities: [
    {
      type: {
        type: String,
        enum: ["note", "email", "stage", "system"],
        default: "note",
      },
      message: { type: String, default: "" },
      at: { type: Date, default: Date.now },
      by: { type: String, default: "" },
      _id: false,
    },
  ],
});

JobApplicationSchema.index({ jobOpeningId: 1, email: 1 });
const JobApplication = mongoose.model("JobApplication", JobApplicationSchema);
module.exports = JobApplication;
