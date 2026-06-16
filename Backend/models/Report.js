const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  reportName: {
    type: String,
    required: true,
  },
  reportType: {
    type: String,
    enum: [
      "Employee",
      "Attendance",
      "Payroll",
      "Leave",
      "Performance",
      "Candidate",
      "Department",
      "Custom",
    ],
    required: true,
  },
  description: {
    type: String,
  },
  generatedBy: {
    type: String,
    required: true,
  },
  generatedDate: {
    type: Date,
    default: Date.now,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  filters: {
    department: String,
    status: String,
    dateRange: String,
  },
  data: mongoose.Schema.Types.Mixed,
  summary: {
    totalRecords: Number,
    filteredRecords: Number,
    metrics: mongoose.Schema.Types.Mixed,
  },
  fileUrl: {
    type: String,
  },
  format: {
    type: String,
    enum: ["PDF", "Excel", "CSV", "JSON"],
    default: "PDF",
  },
  isScheduled: {
    type: Boolean,
    default: false,
  },
  scheduleFrequency: {
    type: String,
    enum: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"],
  },
  nextGenerationDate: {
    type: Date,
  },
});

ReportSchema.index({ reportType: 1, generatedDate: -1 });
const Report = mongoose.model("Report", ReportSchema);
module.exports = Report;
