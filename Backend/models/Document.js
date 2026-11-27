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
  // --- Expiry reminder automation (additive / non-breaking) ---
  // Email address notified when this document is approaching expiry. When
  // empty, the sweep falls back to DOCUMENT_REMINDER_EMAIL / EMAIL_FROM.
  notifyEmail: {
    type: String,
    default: "",
    trim: true,
    lowercase: true,
  },
  // How many days before expiry a reminder should go out.
  reminderLeadDays: {
    type: Number,
    default: 30,
    min: 0,
  },
  // The expiryDate value a reminder was last sent for. Used to send at most
  // one reminder per expiry cycle; renewing the document (new expiryDate)
  // makes it eligible again automatically.
  reminderSentFor: {
    type: Date,
  },
  lastReminderSentAt: {
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
