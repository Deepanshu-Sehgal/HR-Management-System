const mongoose = require("mongoose");

const PayrollSchema = new mongoose.Schema({
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
  baseSalary: {
    type: Number,
    required: true,
  },
  allowances: {
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  deductions: {
    incomeTax: { type: Number, default: 0 },
    providentFund: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  overtimeHours: {
    type: Number,
    default: 0,
  },
  overtimeAmount: {
    type: Number,
    default: 0,
  },
  totalAllowances: {
    type: Number,
    default: 0,
  },
  totalDeductions: {
    type: Number,
    default: 0,
  },
  grossSalary: {
    type: Number,
    required: true,
  },
  netSalary: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Processed", "Paid", "Failed"],
    default: "Pending",
  },
  paymentDate: {
    type: Date,
  },
  remarks: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PayrollSchema.index({ employeeId: 1, month: 1, year: 1 });
const Payroll = mongoose.model("Payroll", PayrollSchema);
module.exports = Payroll;
