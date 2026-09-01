const JobApplication = require("../models/JobApplication");
const Pipeline = require("../models/Pipeline");
const Interview = require("../models/Interview");
const Offer = require("../models/Offer");

// Cross-pipeline recruitment overview combining applications, interviews,
// offers, and pipeline tasks into a single analytics payload.
exports.getOverview = async (req, res) => {
  try {
    const now = new Date();

    // Applications (enrolled in a pipeline).
    const apps = await JobApplication.find({ pipelineId: { $ne: null } });
    const pipelines = await Pipeline.find();

    // Map every stage key -> category across all pipelines.
    const stageCat = {};
    const stageName = {};
    pipelines.forEach((p) =>
      p.stages.forEach((s) => {
        stageCat[s.key] = s.category;
        stageName[s.key] = s.name;
      })
    );

    const hires = apps.filter((a) => stageCat[a.stageKey] === "won");
    const active = apps.filter((a) => stageCat[a.stageKey] === "active");

    // Stage distribution (current occupancy).
    const byStage = {};
    apps.forEach((a) => {
      const label = stageName[a.stageKey] || a.stageKey || "Unassigned";
      byStage[label] = (byStage[label] || 0) + 1;
    });

    // Applications by job title (top openings by volume).
    const byJob = {};
    apps.forEach((a) => {
      byJob[a.jobTitle || "—"] = (byJob[a.jobTitle || "—"] || 0) + 1;
    });
    const topJobs = Object.entries(byJob)
      .map(([jobTitle, count]) => ({ jobTitle, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Time-to-hire: for hires, days from applicationDate to the move into a
    // won stage (falls back to updatedAt-equivalent via stage history).
    let tthDays = [];
    hires.forEach((a) => {
      const wonMove = (a.stageHistory || [])
        .filter((h) => stageCat[h.toStage] === "won")
        .sort((x, y) => new Date(x.movedAt) - new Date(y.movedAt))[0];
      const end = wonMove ? new Date(wonMove.movedAt) : a.stageEnteredAt;
      if (a.applicationDate && end) {
        const days = (new Date(end) - new Date(a.applicationDate)) / (1000 * 60 * 60 * 24);
        if (days >= 0) tthDays.push(days);
      }
    });
    const avgTimeToHire = tthDays.length
      ? Math.round(tthDays.reduce((s, d) => s + d, 0) / tthDays.length)
      : 0;

    // Tasks (open / overdue) across all applications.
    let openTasks = 0;
    let overdueTasks = 0;
    apps.forEach((a) => {
      (a.tasks || []).forEach((t) => {
        if (!t.done) {
          openTasks += 1;
          if (t.dueDate && new Date(t.dueDate) < now) overdueTasks += 1;
        }
      });
    });

    // SLA-breached applications (stage due date passed).
    const slaBreached = apps.filter((a) => a.dueAt && new Date(a.dueAt) < now).length;

    // Interviews.
    const interviews = await Interview.find();
    const interviewStats = {
      total: interviews.length,
      scheduled: interviews.filter((i) => i.status === "Scheduled").length,
      completed: interviews.filter((i) => i.status === "Completed").length,
      upcoming: interviews.filter(
        (i) => i.status === "Scheduled" && i.scheduledAt && new Date(i.scheduledAt) >= now
      ).length,
    };

    // Offers.
    const offers = await Offer.find();
    const offerCounts = { Sent: 0, Accepted: 0, Declined: 0, Expired: 0 };
    offers.forEach((o) => {
      if (offerCounts[o.status] !== undefined) offerCounts[o.status] += 1;
    });
    const decided = offerCounts.Accepted + offerCounts.Declined + offerCounts.Expired;

    res.status(200).json({
      totals: {
        candidates: apps.length,
        active: active.length,
        hires: hires.length,
        conversionRate: apps.length ? Math.round((hires.length / apps.length) * 100) : 0,
        avgTimeToHire,
        openTasks,
        overdueTasks,
        slaBreached,
      },
      byStage: Object.entries(byStage).map(([name, count]) => ({ name, count })),
      topJobs,
      interviews: interviewStats,
      offers: {
        total: offers.length,
        ...offerCounts,
        acceptanceRate: decided ? Math.round((offerCounts.Accepted / decided) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
