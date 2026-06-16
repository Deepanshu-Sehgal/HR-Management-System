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
});

JobApplicationSchema.index({ jobOpeningId: 1, email: 1 });
const JobApplication = mongoose.model("JobApplication", JobApplicationSchema);
module.exports = JobApplication;
