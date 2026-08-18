const Onboarding = require("../models/Onboarding");
const { sendEmail } = require("../utils/email");
const logger = require("../utils/logger");

// Create an onboarding record. If no tasks are supplied, auto-generate the
// default checklist relative to the start date, then email the new hire.
exports.createOnboarding = async (req, res) => {
  try {
    const {
      employeeName,
      employeeEmail,
      department,
      position,
      startDate,
      applicationId,
      tasks,
      createdBy,
    } = req.body;

    const onboarding = new Onboarding({
      employeeName,
      employeeEmail,
      department,
      position,
      startDate,
      applicationId: applicationId || null,
      tasks: tasks && tasks.length ? tasks : Onboarding.defaultTasks(startDate),
      createdBy: createdBy || "HR",
    });
    onboarding.recomputeProgress();
    await onboarding.save();

    if (employeeEmail) {
      try {
        await sendEmail({
          to: employeeEmail,
          subject: `Welcome aboard, ${employeeName}!`,
          text: `Hi ${employeeName}, we're excited to have you join as ${position || "a new team member"}. Your onboarding checklist has been set up and HR will guide you through each step before your start date (${new Date(
            startDate
          ).toDateString()}).`,
          html: `<p>Hi ${employeeName},</p><p>We're excited to have you join${
            position ? ` as <strong>${position}</strong>` : ""
          }. Your onboarding checklist has been set up and HR will guide you through each step before your start date (<strong>${new Date(
            startDate
          ).toDateString()}</strong>).</p>`,
        });
      } catch (err) {
        logger.error(`Onboarding welcome email failed: ${err.message}`);
      }
    }

    res.status(201).json({ message: "Onboarding created", onboarding });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOnboardings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.department) filter.department = req.query.department;
    const onboardings = await Onboarding.find(filter).sort({ startDate: 1 });
    res.status(200).json(onboardings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOnboardingById = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) return res.status(404).json({ message: "Onboarding not found" });
    res.status(200).json(onboarding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle / set a single task's status, then recompute progress. When the
// checklist reaches 100%, email a completion note to the hire.
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, assignedTo, notes } = req.body;
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) return res.status(404).json({ message: "Onboarding not found" });

    const task = onboarding.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (status !== undefined) {
      task.status = status;
      task.completedAt = status === "Done" ? new Date() : undefined;
    }
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (notes !== undefined) task.notes = notes;

    const wasCompleted = onboarding.status === "Completed";
    onboarding.recomputeProgress();
    await onboarding.save();

    if (!wasCompleted && onboarding.status === "Completed" && onboarding.employeeEmail) {
      try {
        await sendEmail({
          to: onboarding.employeeEmail,
          subject: "Your onboarding is complete 🎉",
          text: `Hi ${onboarding.employeeName}, all onboarding steps are done. Welcome to the team!`,
          html: `<p>Hi ${onboarding.employeeName},</p><p>All onboarding steps are complete. Welcome to the team! 🎉</p>`,
        });
      } catch (err) {
        logger.error(`Onboarding completion email failed: ${err.message}`);
      }
    }

    res.status(200).json({ message: "Task updated", onboarding });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add an ad-hoc task to an existing onboarding.
exports.addTask = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) return res.status(404).json({ message: "Onboarding not found" });
    const { title, category, assignedTo, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });
    onboarding.tasks.push({ title, category, assignedTo, dueDate });
    onboarding.recomputeProgress();
    await onboarding.save();
    res.status(200).json({ message: "Task added", onboarding });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findByIdAndDelete(req.params.id);
    if (!onboarding) return res.status(404).json({ message: "Onboarding not found" });
    res.status(200).json({ message: "Onboarding deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Dashboard stats: counts by status + overdue task count across all records.
exports.getStats = async (req, res) => {
  try {
    const all = await Onboarding.find();
    const now = new Date();
    const stats = {
      total: all.length,
      notStarted: all.filter((o) => o.status === "Not Started").length,
      inProgress: all.filter((o) => o.status === "In Progress").length,
      completed: all.filter((o) => o.status === "Completed").length,
      overdueTasks: 0,
    };
    all.forEach((o) => {
      o.tasks.forEach((t) => {
        if (t.status !== "Done" && t.dueDate && t.dueDate < now) stats.overdueTasks += 1;
      });
    });
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
