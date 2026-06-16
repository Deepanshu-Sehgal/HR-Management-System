const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  department: {
    type: String,
  },
  category: {
    type: String,
    enum: ["Company", "Department", "Urgent", "Event", "Other"],
    default: "Company",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  publishDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
  },
  views: {
    type: Number,
    default: 0,
  },
  attachments: [String],
});

AnnouncementSchema.index({ publishDate: -1, isActive: 1 });
const Announcement = mongoose.model("Announcement", AnnouncementSchema);
module.exports = Announcement;
