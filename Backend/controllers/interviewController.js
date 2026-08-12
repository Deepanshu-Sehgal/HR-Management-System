const Interview = require("../models/Interview");
const JobApplication = require("../models/JobApplication");
const { sendEmail } = require("../utils/email");
const logger = require("../utils/logger");

// Append an entry to the linked application's activity timeline (best-effort).
async function logToApplication(applicationId, message, by) {
  try {
    await JobApplication.findByIdAndUpdate(applicationId, {
      $push: {
        activities: {
          type: "system",
          message,
          at: new Date(),
          by: by || "system",
        },
      },
    });
  } catch (err) {
    logger.error(`Failed to log interview activity: ${err.message}`);
  }
}

function formatWhen(date) {
  return new Date(date).toLocaleString();
}

// ----- Create -----
exports.createInterview = async (req, res) => {
  try {
    const app = await JobApplication.findById(req.body.applicationId);
    if (!app) return res.status(404).json({ message: "Application not found" });

    const interview = new Interview({
      applicationId: app._id,
      pipelineId: app.pipelineId || null,
      candidateName: app.applicantName,
      jobTitle: app.jobTitle,
      email: app.email,
      scheduledAt: req.body.scheduledAt,
      durationMins: req.body.durationMins,
      mode: req.body.mode,
      location: req.body.location,
      interviewer: req.body.interviewer,
      round: req.body.round,
      createdBy: req.body.createdBy || "HR",
    });
    await interview.save();

    // Automated invite email to the candidate.
    if (app.email) {
      const when = formatWhen(interview.scheduledAt);
      const subject = `Interview scheduled - ${interview.jobTitle}`;
      const lines = [
        `Hi ${interview.candidateName},`,
        "",
        `Your ${interview.round} for ${interview.jobTitle} has been scheduled.`,
        `When: ${when} (${interview.durationMins} mins)`,
        `Mode: ${interview.mode}`,
        interview.location ? `Where: ${interview.location}` : "",
        interview.interviewer ? `Interviewer: ${interview.interviewer}` : "",
        "",
        "Please reply if you need to reschedule. Good luck!",
      ].filter(Boolean);
      try {
        await sendEmail({
          to: app.email,
          subject,
          text: lines.join("\n"),
          html: `<p>${lines.join("<br/>")}</p>`,
        });
      } catch (err) {
        logger.error(`Interview invite email failed: ${err.message}`);
      }
    }

    await logToApplication(
      app._id,
      `Interview (${interview.round}) scheduled for ${formatWhen(interview.scheduledAt)}`,
      interview.createdBy
    );

    res.status(201).json({ message: "Interview scheduled", interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Read -----
exports.getInterviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.applicationId) filter.applicationId = req.query.applicationId;
    if (req.query.status) filter.status = req.query.status;
    const interviews = await Interview.find(filter).sort({ scheduledAt: 1 });
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upcoming (future, still Scheduled) interviews, optionally limited.
exports.getUpcoming = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const interviews = await Interview.find({
      status: "Scheduled",
      scheduledAt: { $gte: new Date() },
    })
      .sort({ scheduledAt: 1 })
      .limit(limit);
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInterviewsByApplication = async (req, res) => {
  try {
    const interviews = await Interview.find({
      applicationId: req.params.applicationId,
    }).sort({ scheduledAt: 1 });
    res.status(200).json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Update (reschedule / record feedback / change status) -----
exports.updateInterview = async (req, res) => {
  try {
    const existing = await Interview.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Interview not found" });

    const rescheduled =
      req.body.scheduledAt &&
      new Date(req.body.scheduledAt).getTime() !==
        new Date(existing.scheduledAt).getTime();

    const fields = [
      "scheduledAt",
      "durationMins",
      "mode",
      "location",
      "interviewer",
      "round",
      "status",
      "feedback",
      "rating",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) existing[f] = req.body[f];
    });
    await existing.save();

    if (rescheduled && existing.email) {
      try {
        await sendEmail({
          to: existing.email,
          subject: `Interview rescheduled - ${existing.jobTitle}`,
          text: `Hi ${existing.candidateName}, your ${existing.round} has been moved to ${formatWhen(
            existing.scheduledAt
          )}.`,
          html: `<p>Hi ${existing.candidateName},</p><p>Your ${existing.round} for <strong>${existing.jobTitle}</strong> has been moved to <strong>${formatWhen(
            existing.scheduledAt
          )}</strong>.</p>`,
        });
      } catch (err) {
        logger.error(`Interview reschedule email failed: ${err.message}`);
      }
      await logToApplication(
        existing.applicationId,
        `Interview rescheduled to ${formatWhen(existing.scheduledAt)}`,
        req.body.updatedBy
      );
    }

    if (req.body.status && req.body.status !== "Scheduled") {
      await logToApplication(
        existing.applicationId,
        `Interview (${existing.round}) marked ${existing.status}${
          existing.rating ? ` - rated ${existing.rating}/5` : ""
        }`,
        req.body.updatedBy
      );
    }

    res.status(200).json({ message: "Interview updated", interview: existing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Cancel -----
exports.cancelInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true }
    );
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    if (interview.email) {
      try {
        await sendEmail({
          to: interview.email,
          subject: `Interview cancelled - ${interview.jobTitle}`,
          text: `Hi ${interview.candidateName}, your ${interview.round} for ${interview.jobTitle} has been cancelled. We'll follow up with next steps.`,
          html: `<p>Hi ${interview.candidateName},</p><p>Your ${interview.round} for <strong>${interview.jobTitle}</strong> has been cancelled. We'll follow up with next steps.</p>`,
        });
      } catch (err) {
        logger.error(`Interview cancel email failed: ${err.message}`);
      }
    }
    await logToApplication(
      interview.applicationId,
      `Interview (${interview.round}) cancelled`,
      req.body.updatedBy
    );

    res.status(200).json({ message: "Interview cancelled", interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Delete -----
exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.status(200).json({ message: "Interview deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
