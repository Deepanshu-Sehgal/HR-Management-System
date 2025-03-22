// by Paras

const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  department: { type: String },
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

// You can also add an index if you expect to search by candidateName often
LeaveSchema.index({ name: 1 });

const Leave = mongoose.model("Leave", LeaveSchema);

module.exports = Leave;
