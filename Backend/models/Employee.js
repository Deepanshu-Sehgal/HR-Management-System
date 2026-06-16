// by Paras

const mongoose = require("mongoose");

// Define the Employee schema for all employee records
const EmployeeSchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Ensure unique email addresses
    lowercase: true, // Normalize email formatting
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  experience: {
    type: String,
    required: true,
    trim: true,
  },
  task: {
    type: String,
  },
  status: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

// Index by employee name to optimize name searches
EmployeeSchema.index({ employeeName: 1 });

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;
