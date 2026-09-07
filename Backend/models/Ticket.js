const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    by: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    // Human-friendly reference, e.g. "TKT-1024".
    ticketId: { type: String, unique: true, index: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Payroll", "Leave", "IT", "Benefits", "Facilities", "General"],
      default: "General",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    raisedByName: { type: String, required: true, trim: true },
    raisedByEmail: { type: String, default: "", lowercase: true, trim: true },
    assignedTo: { type: String, default: "" },
    // SLA deadline derived from priority at creation time.
    dueAt: { type: Date },
    resolution: { type: String, default: "" },
    resolvedAt: { type: Date },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

// SLA response windows (in hours) keyed by priority.
ticketSchema.statics.slaHours = { Urgent: 4, High: 24, Medium: 72, Low: 120 };

ticketSchema.index({ status: 1, priority: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
