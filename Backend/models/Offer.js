const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
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
    candidateName: { type: String, required: true, trim: true },
    candidateEmail: { type: String, default: "", lowercase: true, trim: true },
    jobTitle: { type: String, default: "" },
    department: { type: String, default: "" },

    salary: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    joiningDate: { type: Date },
    offerDate: { type: Date, default: Date.now },
    // Deadline for the candidate to respond; auto-expires when passed.
    expiryDate: { type: Date },

    status: {
      type: String,
      enum: ["Draft", "Sent", "Accepted", "Declined", "Expired", "Withdrawn"],
      default: "Draft",
    },
    // Set once acceptance auto-generates an onboarding record (prevents dupes).
    onboardingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Onboarding",
      default: null,
    },
    notes: { type: String, default: "" },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

offerSchema.index({ applicationId: 1 });
offerSchema.index({ status: 1, expiryDate: 1 });

const Offer = mongoose.model("Offer", offerSchema);
module.exports = Offer;
