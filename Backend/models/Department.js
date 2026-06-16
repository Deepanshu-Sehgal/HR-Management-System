const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  departmentCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  manager: {
    type: String,
  },
  description: {
    type: String,
  },
  budget: {
    type: Number,
    default: 0,
  },
  employeeCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

DepartmentSchema.index({ departmentName: 1 });
const Department = mongoose.model("Department", DepartmentSchema);
module.exports = Department;
