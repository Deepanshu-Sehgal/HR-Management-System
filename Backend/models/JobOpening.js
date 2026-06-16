const mongoose = require("mongoose");

const JobOpeningSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  responsibilities: {
    type: String,
  },
  qualifications: {
    type: String,
  },
  requiredSkills: [String],
  salaryRange: {
    min: Number,
    max: Number,
  },
  jobType: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Temporary"],
    default: "Full-time",
  },
  location: {
    type: String,
  },
  experience: {
    type: String,
  },
  numberOfPositions: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ["Open", "Closed", "On Hold"],
    default: "Open",
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  closingDate: {
    type: Date,
  },
  applicantCount: {
    type: Number,
    default: 0,
  },
});

JobOpeningSchema.index({ jobTitle: 1, status: 1 });
const JobOpening = mongoose.model("JobOpening", JobOpeningSchema);
module.exports = JobOpening;
