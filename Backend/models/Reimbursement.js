const mongoose = require("mongoose");

const ReimbursementSchema = new mongoose.Schema({
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
  department: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: "USD",
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  receiptUrl: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
  approverName: {
    type: String,
    trim: true,
  },
  comments: {
    type: String,
    trim: true,
  },
});

ReimbursementSchema.index({ employeeId: 1, status: 1 });

const Reimbursement = mongoose.model("Reimbursement", ReimbursementSchema);
module.exports = Reimbursement;
