const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  documentName: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    enum: ["Contract", "Policy", "Procedure", "Form", "Certificate", "Other"],
    required: true,
  },
  description: {
    type: String,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: String,
    required: true,
  },
  department: {
    type: String,
  },
  visibility: {
    type: String,
    enum: ["Public", "Internal", "Restricted"],
    default: "Internal",
  },
  accessibleTo: [String],
  version: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
  },
  tags: [String],
  downloadCount: {
    type: Number,
    default: 0,
  },
});

DocumentSchema.index({ documentType: 1, uploadDate: -1 });
const Document = mongoose.model("Document", DocumentSchema);
module.exports = Document;
