// by Paras

const mongoose = require("mongoose");

// Leave schema stores leave request details and uploaded files
const LeaveSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  department: {
    type: String,
  },
  date: {
    type: String,
  },
  leavedate: {
    type: String,
  },
  reason: {
    type: String,
  },
  status: {
    type: String,
  },
  resume: {
    type: String,
  },
  image: {
    type: String,
  },
});

// Index by name for faster leave-search operations
LeaveSchema.index({ name: 1 });

const Leave = mongoose.model("Leave", LeaveSchema);
module.exports = Leave;
