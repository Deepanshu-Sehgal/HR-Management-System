const Pipeline = require("../models/Pipeline");
const JobApplication = require("../models/JobApplication");
const { sendEmail } = require("../utils/email");
const logger = require("../utils/logger");

// Map pipeline stage categories/keys back onto the legacy JobApplication
// `status` enum so existing screens stay consistent.
const STATUS_ENUM = ["Applied", "Shortlisted", "Interview", "Offered", "Rejected", "Hired"];
function deriveStatus(stage) {
  if (!stage) return undefined;
  if (stage.category === "won") return "Hired";
  if (stage.category === "lost") return "Rejected";
  const byName = STATUS_ENUM.find((s) => s.toLowerCase() === stage.name.toLowerCase());
  if (byName) return byName;
  const aliases = { screening: "Shortlisted", offer: "Offered" };
  return aliases[stage.key] || undefined;
}

// Replace {{placeholder}} tokens in an automation template.
function renderTemplate(template, vars) {
  if (!template) return "";
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
    vars[key] != null ? String(vars[key]) : ""
  );
}

// Add N business days (skip Sat/Sun) to a date. Returns null when days <= 0.
function addBusinessDays(from, days) {
  if (!days || days <= 0) return null;
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return d;
}

// Core automation runner: applies a stage's rules to an application in place.
// Mutates `app` (does not save). Returns a list of automation notes.
async function runStageAutomation(app, stage) {
  const notes = [];
  const now = new Date();

  // SLA due date
  app.dueAt = addBusinessDays(now, stage.automation?.slaDays);

  // Automated candidate email
  if (stage.automation?.emailEnabled && app.email) {
    const vars = {
      candidateName: app.applicantName,
      jobTitle: app.jobTitle,
      stage: stage.name,
    };
    const subject =
      renderTemplate(stage.automation.emailSubject, vars) ||
      `Update on your application - ${app.jobTitle}`;
    const body = renderTemplate(stage.automation.emailTemplate, vars);
    try {
      await sendEmail({
        to: app.email,
        subject,
        text: body,
        html: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
      });
      app.activities.push({
        type: "email",
        message: `Automated email sent: "${subject}"`,
        at: now,
        by: "system",
      });
      notes.push("email-sent");
    } catch (err) {
      logger.error(`Pipeline automation email failed for ${app.email}: ${err.message}`);
      app.activities.push({
        type: "system",
        message: `Automated email FAILED: ${err.message}`,
        at: now,
        by: "system",
      });
      notes.push("email-failed");
    }
  }

  return notes;
}

// ----- Pipeline CRUD -----

exports.createPipeline = async (req, res) => {
  try {
    const { name, description, jobOpeningId, stages, isDefault, createdBy } = req.body;
    const pipeline = new Pipeline({
      name,
      description,
      jobOpeningId: jobOpeningId || null,
      stages: stages && stages.length ? stages : Pipeline.defaultStages(),
      isDefault: !!isDefault,
      createdBy: createdBy || "",
    });
    await pipeline.save();
    res.status(201).json({ message: "Pipeline created", pipeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPipelines = async (req, res) => {
  try {
    const filter = {};
    if (req.query.jobOpeningId) filter.jobOpeningId = req.query.jobOpeningId;
    const pipelines = await Pipeline.find(filter).sort({ isDefault: -1, createdAt: 1 });
    res.status(200).json(pipelines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPipelineById = async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ message: "Pipeline not found" });
    res.status(200).json(pipeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pipeline) return res.status(404).json({ message: "Pipeline not found" });
    res.status(200).json({ message: "Pipeline updated", pipeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findByIdAndDelete(req.params.id);
    if (!pipeline) return res.status(404).json({ message: "Pipeline not found" });
    // Detach any applications enrolled in this pipeline.
    await JobApplication.updateMany(
      { pipelineId: pipeline._id },
      { $set: { pipelineId: null, stageKey: null, dueAt: null } }
    );
    res.status(200).json({ message: "Pipeline deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ensure a usable default pipeline exists; returns it. Used to bootstrap the UI.
exports.ensureDefaultPipeline = async (req, res) => {
  try {
    let pipeline = await Pipeline.findOne({ isDefault: true });
    if (!pipeline) {
      pipeline = await Pipeline.create({
        name: "Default Hiring Pipeline",
        description: "Standard recruitment flow from application to hire.",
        stages: Pipeline.defaultStages(),
        isDefault: true,
      });
    }
    res.status(200).json(pipeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Board & movement -----

// Returns the pipeline plus its applications grouped by stage key, with
// derived per-stage metrics (count, overdue count).
exports.getBoard = async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ message: "Pipeline not found" });

    const applications = await JobApplication.find({ pipelineId: pipeline._id }).sort({
      stageEnteredAt: -1,
      applicationDate: -1,
    });

    const now = new Date();
    const columns = pipeline.stages
      .sort((a, b) => a.order - b.order)
      .map((stage) => {
        const items = applications.filter((a) => a.stageKey === stage.key);
        return {
          key: stage.key,
          name: stage.name,
          order: stage.order,
          category: stage.category,
          color: stage.color,
          automation: stage.automation,
          count: items.length,
          overdueCount: items.filter((a) => a.dueAt && a.dueAt < now).length,
          applications: items,
        };
      });

    res.status(200).json({ pipeline, columns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enroll an existing JobApplication into a pipeline at its first stage.
exports.enrollApplication = async (req, res) => {
  try {
    const { applicationId, pipelineId, stageKey } = req.body;
    const pipeline = await Pipeline.findById(pipelineId);
    if (!pipeline) return res.status(404).json({ message: "Pipeline not found" });

    const app = await JobApplication.findById(applicationId);
    if (!app) return res.status(404).json({ message: "Application not found" });

    const sortedStages = [...pipeline.stages].sort((a, b) => a.order - b.order);
    const stage = stageKey
      ? sortedStages.find((s) => s.key === stageKey)
      : sortedStages[0];
    if (!stage) return res.status(400).json({ message: "Invalid stage" });

    app.pipelineId = pipeline._id;
    app.stageKey = stage.key;
    app.stageEnteredAt = new Date();
    app.stageHistory.push({
      fromStage: null,
      toStage: stage.key,
      movedAt: new Date(),
      movedBy: req.body.by || "system",
      note: "Enrolled in pipeline",
    });
    app.activities.push({
      type: "system",
      message: `Enrolled in "${pipeline.name}" at stage ${stage.name}`,
      by: req.body.by || "system",
    });
    const derived = deriveStatus(stage);
    if (derived) app.status = derived;

    await runStageAutomation(app, stage);
    await app.save();

    res.status(200).json({ message: "Application enrolled", application: app });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Move an application to a different stage and fire that stage's automation.
exports.moveStage = async (req, res) => {
  try {
    const { stageKey, note, by } = req.body;
    const app = await JobApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (!app.pipelineId)
      return res.status(400).json({ message: "Application is not enrolled in a pipeline" });

    const pipeline = await Pipeline.findById(app.pipelineId);
    if (!pipeline) return res.status(404).json({ message: "Pipeline not found" });

    const stage = pipeline.stages.find((s) => s.key === stageKey);
    if (!stage) return res.status(400).json({ message: "Invalid target stage" });

    const fromStage = app.stageKey;
    app.stageKey = stage.key;
    app.stageEnteredAt = new Date();
    app.stageHistory.push({
      fromStage,
      toStage: stage.key,
      movedAt: new Date(),
      movedBy: by || "system",
      note: note || "",
    });
    app.activities.push({
      type: "stage",
      message: `Moved from ${fromStage || "start"} to ${stage.name}${note ? ` - ${note}` : ""}`,
      by: by || "system",
    });
    const derived = deriveStatus(stage);
    if (derived) app.status = derived;

    const automationNotes = await runStageAutomation(app, stage);
    await app.save();

    res.status(200).json({
      message: "Application moved",
      automation: automationNotes,
      application: app,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update lightweight lead metadata: recruiter owner and tags.
exports.updateApplicationMeta = async (req, res) => {
  try {
    const { assignedTo, tags } = req.body;
    const app = await JobApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    if (assignedTo !== undefined) app.assignedTo = assignedTo;
    if (Array.isArray(tags)) {
      app.tags = [
        ...new Set(tags.map((t) => String(t).trim()).filter(Boolean)),
      ].slice(0, 20);
    }
    await app.save();
    res.status(200).json({ message: "Application updated", application: app });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Append a manual note/comment to an application's activity timeline.
exports.addActivity = async (req, res) => {
  try {
    const { message, by, type } = req.body;
    if (!message) return res.status(400).json({ message: "message is required" });
    const app = await JobApplication.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          activities: { type: type || "note", message, by: by || "", at: new Date() },
        },
      },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Activity added", application: app });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Tasks (per-application to-dos) -----

// Add a task to an application and log it on the activity timeline.
exports.addTask = async (req, res) => {
  try {
    const { title, assignedTo, dueDate, priority, by } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });
    const app = await JobApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    app.tasks.push({
      title,
      assignedTo: assignedTo || "",
      dueDate: dueDate || undefined,
      priority: priority || "Medium",
    });
    app.activities.push({
      type: "system",
      message: `Task added: ${title}`,
      by: by || "HR",
    });
    await app.save();
    res.status(200).json({ message: "Task added", application: app });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a task (toggle done, reassign, reschedule, reprioritize).
exports.updateTask = async (req, res) => {
  try {
    const app = await JobApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    const task = app.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { title, assignedTo, dueDate, priority, done, by } = req.body;
    if (title !== undefined) task.title = title;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate || undefined;
    if (priority !== undefined) task.priority = priority;
    if (done !== undefined) {
      task.done = done;
      task.completedAt = done ? new Date() : undefined;
      app.activities.push({
        type: "system",
        message: `Task ${done ? "completed" : "reopened"}: ${task.title}`,
        by: by || "HR",
      });
    }
    await app.save();
    res.status(200).json({ message: "Task updated", application: app });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task from an application.
exports.deleteTask = async (req, res) => {
  try {
    const app = await JobApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    const task = app.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.deleteOne();
    await app.save();
    res.status(200).json({ message: "Task deleted", application: app });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cross-application task tracker: flatten all tasks (optionally filtered by
// pipeline / open / overdue / assignee) with candidate context attached.
exports.getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.pipelineId) filter.pipelineId = req.query.pipelineId;
    const apps = await JobApplication.find({ ...filter, "tasks.0": { $exists: true } });

    const now = new Date();
    let tasks = [];
    apps.forEach((app) => {
      (app.tasks || []).forEach((t) => {
        tasks.push({
          _id: t._id,
          applicationId: app._id,
          applicantName: app.applicantName,
          jobTitle: app.jobTitle,
          stageKey: app.stageKey,
          title: t.title,
          assignedTo: t.assignedTo,
          dueDate: t.dueDate,
          priority: t.priority,
          done: t.done,
          overdue: !t.done && t.dueDate && new Date(t.dueDate) < now,
        });
      });
    });

    if (req.query.open === "true") tasks = tasks.filter((t) => !t.done);
    if (req.query.overdue === "true") tasks = tasks.filter((t) => t.overdue);
    if (req.query.assignedTo)
      tasks = tasks.filter((t) => t.assignedTo === req.query.assignedTo);

    // Open first, then by due date (undated last), then by priority.
    const prio = { High: 0, Medium: 1, Low: 2 };
    tasks.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      if (ad !== bd) return ad - bd;
      return (prio[a.priority] ?? 1) - (prio[b.priority] ?? 1);
    });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Analytics -----

// Funnel metrics for a pipeline: count + stage-to-stage conversion rate.
exports.getFunnel = async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) return res.status(404).json({ message: "Pipeline not found" });

    const apps = await JobApplication.find({ pipelineId: pipeline._id });
    const sorted = [...pipeline.stages].sort((a, b) => a.order - b.order);

    // Count how many applications have ever reached each stage (via history),
    // so the funnel reflects throughput rather than only current occupancy.
    const reached = {};
    sorted.forEach((s) => (reached[s.key] = 0));
    apps.forEach((app) => {
      const seen = new Set(
        (app.stageHistory || []).map((h) => h.toStage).concat(app.stageKey || [])
      );
      seen.forEach((k) => {
        if (reached[k] != null) reached[k] += 1;
      });
    });

    const funnel = sorted.map((stage, i) => {
      const count = reached[stage.key] || 0;
      const prev = i > 0 ? reached[sorted[i - 1].key] || 0 : count;
      return {
        key: stage.key,
        name: stage.name,
        category: stage.category,
        color: stage.color,
        reached: count,
        current: apps.filter((a) => a.stageKey === stage.key).length,
        conversionFromPrev: prev > 0 ? Math.round((count / prev) * 100) : 0,
      };
    });

    const total = apps.length;
    const hired = apps.filter((a) => {
      const st = sorted.find((s) => s.key === a.stageKey);
      return st && st.category === "won";
    }).length;

    res.status(200).json({
      pipeline: { _id: pipeline._id, name: pipeline.name },
      total,
      hired,
      hireRate: total > 0 ? Math.round((hired / total) * 100) : 0,
      funnel,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Applications whose SLA has elapsed (overdue in their current stage).
exports.getOverdue = async (req, res) => {
  try {
    const now = new Date();
    const filter = { dueAt: { $ne: null, $lt: now } };
    if (req.query.pipelineId) filter.pipelineId = req.query.pipelineId;
    const overdue = await JobApplication.find(filter).sort({ dueAt: 1 });
    res.status(200).json(overdue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Automation sweep (invoked on a schedule from index.js) -----

// Scans every enrolled application; for those past SLA in a stage configured
// with `autoAdvanceTo`, auto-moves them (firing the target stage's automation).
// Returns a summary. Safe to call repeatedly.
async function runSlaSweep() {
  const now = new Date();
  const overdue = await JobApplication.find({ dueAt: { $ne: null, $lt: now } });
  let advanced = 0;
  let flagged = 0;

  for (const app of overdue) {
    try {
      const pipeline = await Pipeline.findById(app.pipelineId);
      if (!pipeline) continue;
      const current = pipeline.stages.find((s) => s.key === app.stageKey);
      const target =
        current &&
        current.automation?.autoAdvanceTo &&
        pipeline.stages.find((s) => s.key === current.automation.autoAdvanceTo);

      if (target) {
        const fromStage = app.stageKey;
        app.stageKey = target.key;
        app.stageEnteredAt = now;
        app.stageHistory.push({
          fromStage,
          toStage: target.key,
          movedAt: now,
          movedBy: "system",
          note: "Auto-advanced by SLA sweep",
        });
        app.activities.push({
          type: "system",
          message: `SLA elapsed in ${current.name}; auto-advanced to ${target.name}`,
          by: "system",
        });
        const derived = deriveStatus(target);
        if (derived) app.status = derived;
        await runStageAutomation(app, target);
        await app.save();
        advanced += 1;
      } else {
        flagged += 1;
      }
    } catch (err) {
      logger.error(`SLA sweep error for application ${app._id}: ${err.message}`);
    }
  }

  if (advanced || flagged) {
    logger.info(`Pipeline SLA sweep: ${advanced} auto-advanced, ${flagged} flagged overdue`);
  }
  return { advanced, flagged, scanned: overdue.length };
}
exports.runSlaSweep = runSlaSweep;

// HTTP trigger for the sweep (manual "run automation now" button).
exports.triggerSlaSweep = async (req, res) => {
  try {
    const result = await runSlaSweep();
    res.status(200).json({ message: "SLA sweep complete", ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
