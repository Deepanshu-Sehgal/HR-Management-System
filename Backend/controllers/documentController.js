const Document = require("../models/Document");
const { sendEmail } = require("../utils/email");
const logger = require("../utils/logger");

// Create Document
exports.createDocument = async (req, res) => {
  try {
    const {
      documentName,
      documentType,
      description,
      fileUrl,
      uploadedBy,
      department,
      visibility,
      accessibleTo,
      tags,
      expiryDate,
    } = req.body;

    const newDocument = new Document({
      documentName,
      documentType,
      description,
      fileUrl,
      uploadedBy,
      department,
      visibility,
      accessibleTo,
      tags,
      expiryDate,
    });

    await newDocument.save();
    res.status(201).json({ message: "Document uploaded successfully", document: newDocument });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Documents
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ isActive: true }).sort({ uploadDate: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Documents by Type
exports.getDocumentsByType = async (req, res) => {
  try {
    const documents = await Document.find({
      documentType: req.params.type,
      isActive: true,
    }).sort({ uploadDate: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search Documents
exports.searchDocuments = async (req, res) => {
  try {
    const { query } = req.query;
    const documents = await Document.find({
      $or: [
        { documentName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
      isActive: true,
    });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Document
exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.status(200).json({ message: "Document updated successfully", document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deactivate Document
exports.deactivateDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.status(200).json({ message: "Document deactivated successfully", document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Expiry reminder automation
// ---------------------------------------------------------------------------

const DAY_MS = 1000 * 60 * 60 * 24;

function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

// Whole days from today until the expiry date (negative = already expired).
function daysUntilExpiry(expiryDate) {
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp.getTime() - startOfToday().getTime()) / DAY_MS);
}

// Classify a document's expiry relative to its reminder lead window.
function expiryStatus(doc) {
  if (!doc.expiryDate) return "none";
  const days = daysUntilExpiry(doc.expiryDate);
  if (days < 0) return "expired";
  const lead = doc.reminderLeadDays == null ? 30 : doc.reminderLeadDays;
  if (days <= lead) return "expiringSoon";
  return "ok";
}

// A reminder has already gone out for the current expiry cycle when a reminder
// was recorded against the same expiryDate value.
function reminderAlreadySent(doc) {
  return (
    doc.reminderSentFor &&
    doc.expiryDate &&
    new Date(doc.reminderSentFor).getTime() === new Date(doc.expiryDate).getTime()
  );
}

function resolveRecipient(doc) {
  return (
    doc.notifyEmail ||
    process.env.DOCUMENT_REMINDER_EMAIL ||
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    ""
  );
}

function composeReminder(doc) {
  const days = daysUntilExpiry(doc.expiryDate);
  const when =
    days < 0
      ? `expired ${Math.abs(days)} day(s) ago`
      : days === 0
      ? "expires today"
      : `expires in ${days} day(s)`;
  const dateStr = new Date(doc.expiryDate).toDateString();
  return {
    subject: `⏰ Document ${days < 0 ? "expired" : "expiring"}: ${doc.documentName}`,
    text: `Heads up: the ${doc.documentType} "${doc.documentName}" ${when} (expiry date ${dateStr}). Please review and renew it if needed.`,
    html: `<p>Heads up — the ${doc.documentType} <strong>${doc.documentName}</strong> ${when}.</p><p>Expiry date: <strong>${dateStr}</strong>.</p><p>Please review and renew it if needed.</p>`,
  };
}

// GET /documents/expiring?days=30
// Active documents that are expired or expiring within the window.
exports.getExpiringDocuments = async (req, res) => {
  try {
    const windowDays = Math.min(
      Math.max(parseInt(req.query.days, 10) || 30, 1),
      3650
    );
    const docs = await Document.find({
      isActive: true,
      expiryDate: { $ne: null },
    }).sort({ expiryDate: 1 });

    const items = docs
      .map((d) => {
        const days = daysUntilExpiry(d.expiryDate);
        return {
          _id: d._id,
          documentName: d.documentName,
          documentType: d.documentType,
          department: d.department || "",
          expiryDate: d.expiryDate,
          notifyEmail: d.notifyEmail || "",
          reminderLeadDays: d.reminderLeadDays,
          daysUntilExpiry: days,
          status: expiryStatus(d),
          reminderSent: reminderAlreadySent(d),
          lastReminderSentAt: d.lastReminderSentAt || null,
        };
      })
      .filter((d) => d.daysUntilExpiry <= windowDays);

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /documents/expiry-stats — counts for the dashboard tiles.
exports.getExpiryStats = async (req, res) => {
  try {
    const docs = await Document.find({ isActive: true });
    const stats = {
      tracked: 0,
      expired: 0,
      expiringSoon: 0,
      ok: 0,
      noExpiry: 0,
    };
    docs.forEach((d) => {
      const s = expiryStatus(d);
      if (s === "none") {
        stats.noExpiry += 1;
      } else {
        stats.tracked += 1;
        stats[s] += 1;
      }
    });
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /documents/:id/send-reminder — manually send a reminder for one doc.
exports.sendExpiryReminder = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (!doc.expiryDate) {
      return res.status(400).json({ message: "Document has no expiry date" });
    }
    const to = resolveRecipient(doc);
    if (!to) {
      return res
        .status(400)
        .json({ message: "No recipient email configured for this document" });
    }

    await sendEmail({ to, ...composeReminder(doc) });
    doc.reminderSentFor = doc.expiryDate;
    doc.lastReminderSentAt = new Date();
    await doc.save();

    res.status(200).json({ message: `Reminder sent to ${to}`, document: doc });
  } catch (error) {
    logger.error(`Document reminder failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Core automation: email a reminder for every active document that is expired
// or within its reminder lead window and hasn't been reminded for this cycle.
// Idempotent across runs via reminderSentFor. Safe to call on an interval.
exports.runExpiryReminderSweep = async () => {
  const docs = await Document.find({
    isActive: true,
    expiryDate: { $ne: null },
  });

  let sent = 0;
  let skipped = 0;

  for (const doc of docs) {
    const status = expiryStatus(doc);
    if (status !== "expired" && status !== "expiringSoon") continue;
    if (reminderAlreadySent(doc)) continue;

    const to = resolveRecipient(doc);
    if (!to) {
      skipped += 1;
      continue;
    }

    try {
      await sendEmail({ to, ...composeReminder(doc) });
      doc.reminderSentFor = doc.expiryDate;
      doc.lastReminderSentAt = new Date();
      await doc.save();
      sent += 1;
    } catch (err) {
      logger.error(`Document expiry reminder email failed: ${err.message}`);
      skipped += 1;
    }
  }

  if (sent || skipped) {
    logger.info(`Document expiry sweep: ${sent} reminder(s) sent, ${skipped} skipped`);
  }
  return { sent, skipped };
};

// POST /documents/run-expiry-sweep — manual trigger for the sweep above.
exports.runExpirySweep = async (req, res) => {
  try {
    const result = await exports.runExpiryReminderSweep();
    res.status(200).json({ message: "Expiry reminder sweep complete", ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
