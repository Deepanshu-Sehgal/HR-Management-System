const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  version: {
    type: String,
    trim: true,
    default: "1.0",
  },
  effectiveDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    trim: true,
  },
  attachments: [
    {
      type: String,
      trim: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PolicySchema.index({ title: 1, category: 1 });

const Policy = mongoose.model("Policy", PolicySchema);
module.exports = Policy;
