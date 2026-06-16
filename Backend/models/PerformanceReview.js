const mongoose = require("mongoose");

const PerformanceReviewSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  reviewerName: {
    type: String,
    required: true,
  },
  reviewPeriod: {
    type: String,
    required: true,
  },
  performanceRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  goals: {
    type: String,
  },
  achievements: {
    type: String,
  },
  areasForImprovement: {
    type: String,
  },
  feedback: {
    type: String,
  },
  salary_increment: {
    type: Number,
    default: 0,
  },
  promotion: {
    type: String,
    enum: ["None", "Pending", "Approved", "Rejected"],
    default: "None",
  },
  reviewDate: {
    type: Date,
    default: Date.now,
  },
  nextReviewDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Draft", "Submitted", "Approved", "Completed"],
    default: "Draft",
  },
});

PerformanceReviewSchema.index({ employeeId: 1, reviewPeriod: 1 });
const PerformanceReview = mongoose.model("PerformanceReview", PerformanceReviewSchema);
module.exports = PerformanceReview;
