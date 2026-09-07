const mongoose = require("mongoose");

const PolicyAcknowledgementSchema = new mongoose.Schema({
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Policy",
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    trim: true,
  },
  employeeName: {
    type: String,
    required: true,
    trim: true,
  },
  acknowledgedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Acknowledged", "Pending"],
    default: "Acknowledged",
  },
  comments: {
    type: String,
    trim: true,
  },
});

PolicyAcknowledgementSchema.index({ policyId: 1, employeeId: 1 }, { unique: true });

const PolicyAcknowledgement = mongoose.model("PolicyAcknowledgement", PolicyAcknowledgementSchema);
module.exports = PolicyAcknowledgement;
