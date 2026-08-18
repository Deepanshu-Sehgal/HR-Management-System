const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Documentation", "IT", "HR", "Training", "Compliance", "Access"],
      default: "HR",
    },
    assignedTo: { type: String, default: "" },
    dueDate: { type: Date },
    status: { type: String, enum: ["Pending", "Done"], default: "Pending" },
    completedAt: { type: Date },
    notes: { type: String, default: "" },
  },
  { _id: true }
);

const onboardingSchema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true, trim: true },
    employeeEmail: { type: String, default: "", lowercase: true, trim: true },
    department: { type: String, default: "" },
    position: { type: String, default: "" },
    startDate: { type: Date, required: true },
    // Optional link back to the pipeline application the hire came from.
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobApplication",
      default: null,
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    tasks: { type: [taskSchema], default: [] },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

// Recompute progress + overall status from the task list.
onboardingSchema.methods.recomputeProgress = function () {
  const total = this.tasks.length;
  const done = this.tasks.filter((t) => t.status === "Done").length;
  this.progress = total === 0 ? 0 : Math.round((done / total) * 100);
  if (total === 0 || done === 0) this.status = "Not Started";
  else if (done === total) this.status = "Completed";
  else this.status = "In Progress";
  return this.progress;
};

// Default onboarding checklist generated for a new hire. dueOffsetDays is
// relative to the hire's start date.
onboardingSchema.statics.defaultTasks = function (startDate) {
  const base = startDate ? new Date(startDate) : new Date();
  const withOffset = (days) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  };
  return [
    { title: "Send & collect signed offer letter", category: "Documentation", dueDate: withOffset(-3) },
    { title: "Collect ID proof, tax & bank details", category: "Documentation", dueDate: withOffset(-1) },
    { title: "Create email & system accounts", category: "IT", dueDate: withOffset(0) },
    { title: "Provision laptop & access cards", category: "Access", dueDate: withOffset(0) },
    { title: "Add to payroll & benefits enrolment", category: "HR", dueDate: withOffset(1) },
    { title: "Assign onboarding buddy & team intro", category: "HR", dueDate: withOffset(1) },
    { title: "Complete compliance & policy acknowledgement", category: "Compliance", dueDate: withOffset(3) },
    { title: "Role-specific training kickoff", category: "Training", dueDate: withOffset(5) },
  ];
};

const Onboarding = mongoose.model("Onboarding", onboardingSchema);
module.exports = Onboarding;
