const mongoose = require("mongoose");

const AttendanceAnalyticsSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  totalWorkingDays: {
    type: Number,
    default: 0,
  },
  presentDays: {
    type: Number,
    default: 0,
  },
  absentDays: {
    type: Number,
    default: 0,
  },
  leaveDays: {
    type: Number,
    default: 0,
  },
  halfDays: {
    type: Number,
    default: 0,
  },
  lateDays: {
    type: Number,
    default: 0,
  },
  overtimeHours: {
    type: Number,
    default: 0,
  },
  attendancePercentage: {
    type: Number,
    default: 0,
  },
  trends: [
    {
      date: Date,
      status: String,
      checkInTime: String,
      checkOutTime: String,
      duration: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

AttendanceAnalyticsSchema.index({ employeeId: 1, month: 1, year: 1 });
const AttendanceAnalytics = mongoose.model("AttendanceAnalytics", AttendanceAnalyticsSchema);
module.exports = AttendanceAnalytics;
