const Offer = require("../models/Offer");
const JobApplication = require("../models/JobApplication");
const Pipeline = require("../models/Pipeline");
const Onboarding = require("../models/Onboarding");
const { sendEmail } = require("../utils/email");
const logger = require("../utils/logger");

function money(offer) {
  return `${offer.currency} ${Number(offer.salary || 0).toLocaleString()}`;
}

async function logToApplication(applicationId, message, by) {
  try {
    await JobApplication.findByIdAndUpdate(applicationId, {
      $push: {
        activities: { type: "system", message, at: new Date(), by: by || "system" },
      },
    });
  } catch (err) {
    logger.error(`Offer activity log failed: ${err.message}`);
  }
}

// Send the offer email to the candidate (used by create-with-send and send).
async function emailOffer(offer) {
  if (!offer.candidateEmail) return;
  const lines = [
    `Hi ${offer.candidateName},`,
    "",
    `We're delighted to offer you the position of ${offer.jobTitle}${
      offer.department ? ` in ${offer.department}` : ""
    }.`,
    `Compensation: ${money(offer)}`,
    offer.joiningDate ? `Proposed joining date: ${new Date(offer.joiningDate).toDateString()}` : "",
    offer.expiryDate ? `Please respond by: ${new Date(offer.expiryDate).toDateString()}` : "",
    "",
    "We look forward to your response!",
  ].filter(Boolean);
  try {
    await sendEmail({
      to: offer.candidateEmail,
      subject: `Job Offer - ${offer.jobTitle}`,
      text: lines.join("\n"),
      html: `<p>${lines.join("<br/>")}</p>`,
    });
  } catch (err) {
    logger.error(`Offer email failed: ${err.message}`);
  }
}

// ----- Create -----
exports.createOffer = async (req, res) => {
  try {
    const app = await JobApplication.findById(req.body.applicationId);
    if (!app) return res.status(404).json({ message: "Application not found" });

    const expiry =
      req.body.expiryDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7-day window

    const offer = new Offer({
      applicationId: app._id,
      pipelineId: app.pipelineId || null,
      candidateName: app.applicantName,
      candidateEmail: app.email,
      jobTitle: app.jobTitle,
      department: req.body.department || "",
      salary: req.body.salary,
      currency: req.body.currency || "USD",
      joiningDate: req.body.joiningDate,
      expiryDate: expiry,
      notes: req.body.notes,
      createdBy: req.body.createdBy || "HR",
      status: req.body.send ? "Sent" : "Draft",
    });
    await offer.save();

    if (req.body.send) {
      await emailOffer(offer);
      await logToApplication(app._id, `Offer sent (${money(offer)})`, offer.createdBy);
    } else {
      await logToApplication(app._id, `Offer drafted (${money(offer)})`, offer.createdBy);
    }

    res.status(201).json({ message: "Offer created", offer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Read -----
exports.getOffers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.applicationId) filter.applicationId = req.query.applicationId;
    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOffersByApplication = async (req, res) => {
  try {
    const offers = await Offer.find({ applicationId: req.params.applicationId }).sort({
      createdAt: -1,
    });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Send a drafted offer -----
exports.sendOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    if (!offer.expiryDate)
      offer.expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    offer.status = "Sent";
    await offer.save();
    await emailOffer(offer);
    await logToApplication(offer.applicationId, `Offer sent (${money(offer)})`, req.body.by);
    res.status(200).json({ message: "Offer sent", offer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Update / edit -----
exports.updateOffer = async (req, res) => {
  try {
    const editable = ["salary", "currency", "joiningDate", "expiryDate", "department", "notes"];
    const update = {};
    editable.forEach((f) => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });
    const offer = await Offer.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.status(200).json({ message: "Offer updated", offer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Respond: Accepted / Declined / Withdrawn -----
// On acceptance: move the pipeline application to a "won" stage and
// auto-generate an onboarding record for the new hire.
exports.respondOffer = async (req, res) => {
  try {
    const { status, by } = req.body;
    if (!["Accepted", "Declined", "Withdrawn"].includes(status)) {
      return res.status(400).json({ message: "Invalid response status" });
    }
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    offer.status = status;

    if (status === "Accepted") {
      // Best-effort: advance the application to a won stage.
      try {
        const app = await JobApplication.findById(offer.applicationId);
        if (app) {
          app.status = "Hired";
          if (app.pipelineId) {
            const pipeline = await Pipeline.findById(app.pipelineId);
            const wonStage = pipeline?.stages.find((s) => s.category === "won");
            if (wonStage && app.stageKey !== wonStage.key) {
              app.stageHistory.push({
                fromStage: app.stageKey,
                toStage: wonStage.key,
                movedAt: new Date(),
                movedBy: by || "system",
                note: "Offer accepted",
              });
              app.stageKey = wonStage.key;
              app.stageEnteredAt = new Date();
              app.dueAt = null;
            }
          }
          app.activities.push({
            type: "system",
            message: "Offer accepted 🎉",
            by: by || "system",
          });
          await app.save();
        }
      } catch (err) {
        logger.error(`Offer accept -> app update failed: ${err.message}`);
      }

      // Auto-create onboarding (once).
      if (!offer.onboardingId) {
        try {
          const startDate = offer.joiningDate || new Date();
          const onboarding = await Onboarding.create({
            employeeName: offer.candidateName,
            employeeEmail: offer.candidateEmail,
            department: offer.department,
            position: offer.jobTitle,
            startDate,
            applicationId: offer.applicationId,
            tasks: Onboarding.defaultTasks(startDate),
            createdBy: "system (offer accepted)",
          });
          onboarding.recomputeProgress();
          await onboarding.save();
          offer.onboardingId = onboarding._id;
        } catch (err) {
          logger.error(`Auto-onboarding creation failed: ${err.message}`);
        }
      }
    } else {
      await logToApplication(offer.applicationId, `Offer ${status.toLowerCase()}`, by);
    }

    await offer.save();
    res.status(200).json({ message: `Offer ${status.toLowerCase()}`, offer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.status(200).json({ message: "Offer deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Stats -----
exports.getStats = async (req, res) => {
  try {
    const all = await Offer.find();
    const counts = { Draft: 0, Sent: 0, Accepted: 0, Declined: 0, Expired: 0, Withdrawn: 0 };
    all.forEach((o) => (counts[o.status] = (counts[o.status] || 0) + 1));
    const decided = counts.Accepted + counts.Declined + counts.Expired;
    res.status(200).json({
      total: all.length,
      ...counts,
      acceptanceRate: decided > 0 ? Math.round((counts.Accepted / decided) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----- Expiry automation (scheduled) -----
// Mark Sent offers past their expiry date as Expired.
async function runExpirySweep() {
  const now = new Date();
  const stale = await Offer.find({ status: "Sent", expiryDate: { $ne: null, $lt: now } });
  let expired = 0;
  for (const offer of stale) {
    try {
      offer.status = "Expired";
      await offer.save();
      await logToApplication(offer.applicationId, "Offer expired (no response)", "system");
      expired += 1;
    } catch (err) {
      logger.error(`Offer expiry sweep error for ${offer._id}: ${err.message}`);
    }
  }
  if (expired) logger.info(`Offer expiry sweep: ${expired} offer(s) expired`);
  return { expired, scanned: stale.length };
}
exports.runExpirySweep = runExpirySweep;

exports.triggerExpirySweep = async (req, res) => {
  try {
    const result = await runExpirySweep();
    res.status(200).json({ message: "Expiry sweep complete", ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
