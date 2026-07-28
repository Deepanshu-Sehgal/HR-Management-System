const mongoose = require("mongoose");

const PageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    enum: ["landing", "legal", "other"],
    default: "other",
  },
  subSection: {
    type: String,
    enum: ["privacy", "terms", "about", "contact", "cookie", "support", "other"],
    default: "other",
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "published",
  },
  metadata: {
    type: Map,
    of: String,
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

PageSchema.index({ slug: 1 });

const Page = mongoose.model("Page", PageSchema);
module.exports = Page;
