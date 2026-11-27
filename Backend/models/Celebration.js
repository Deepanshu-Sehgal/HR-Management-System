const mongoose = require("mongoose");

// A log entry recording that a celebration greeting (birthday or work
// anniversary) was sent to an employee in a given year. The unique index on
// {employee, type, year} makes the automated sweep idempotent — each employee
// gets at most one birthday and one anniversary greeting per calendar year,
// even if the sweep runs many times in a day.
const celebrationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeName: { type: String, default: "" },
    type: {
      type: String,
      enum: ["birthday", "anniversary"],
      required: true,
    },
    // Calendar year the greeting was for (e.g. 2026).
    year: { type: Number, required: true },
    // For anniversaries: completed years of service at the time.
    years: { type: Number, default: 0 },
    emailedTo: { type: String, default: "" },
    // "sent" when an email went out, "skipped" when there was no email on file.
    status: {
      type: String,
      enum: ["sent", "skipped"],
      default: "sent",
    },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

celebrationSchema.index({ employee: 1, type: 1, year: 1 }, { unique: true });

const Celebration = mongoose.model("Celebration", celebrationSchema);
module.exports = Celebration;
