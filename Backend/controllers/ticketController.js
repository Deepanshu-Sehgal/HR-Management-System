const Ticket = require("../models/Ticket");
const { sendEmail } = require("../utils/email");
const logger = require("../utils/logger");

// Generate a sequential, human-friendly ticket id (TKT-1001, TKT-1002, ...).
async function nextTicketId() {
  const last = await Ticket.findOne({ ticketId: /^TKT-/ })
    .sort({ createdAt: -1 })
    .select("ticketId");
  const lastNum = last && last.ticketId ? parseInt(last.ticketId.split("-")[1], 10) : 1000;
  return `TKT-${(isNaN(lastNum) ? 1000 : lastNum) + 1}`;
}

function dueFromPriority(priority) {
  const hours = Ticket.slaHours[priority] || 72;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Create a ticket: assign id, set SLA due date from priority, ack the raiser.
exports.createTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      priority,
      raisedByName,
      raisedByEmail,
    } = req.body;

    const ticket = new Ticket({
      ticketId: await nextTicketId(),
      subject,
      description,
      category,
      priority: priority || "Medium",
      raisedByName,
      raisedByEmail,
      dueAt: dueFromPriority(priority || "Medium"),
    });
    await ticket.save();

    if (raisedByEmail) {
      try {
        await sendEmail({
          to: raisedByEmail,
          subject: `[${ticket.ticketId}] We received your request: ${subject}`,
          text: `Hi ${raisedByName}, your ${ticket.category} request has been logged as ${ticket.ticketId} with ${ticket.priority} priority. Our team will respond by ${ticket.dueAt.toLocaleString()}.`,
          html: `<p>Hi ${raisedByName},</p><p>Your <strong>${ticket.category}</strong> request has been logged as <strong>${ticket.ticketId}</strong> (${ticket.priority} priority). We'll respond by <strong>${ticket.dueAt.toLocaleString()}</strong>.</p>`,
        });
      } catch (err) {
        logger.error(`Ticket ack email failed: ${err.message}`);
      }
    }

    res.status(201).json({ message: "Ticket created", ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;
    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update status / assignee / priority. Emails the raiser when resolved.
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const { status, assignedTo, priority, resolution } = req.body;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
    if (priority !== undefined) {
      ticket.priority = priority;
      // Recompute SLA if still open.
      if (["Open", "In Progress"].includes(ticket.status)) {
        ticket.dueAt = dueFromPriority(priority);
      }
    }
    if (resolution !== undefined) ticket.resolution = resolution;

    const wasResolved = ["Resolved", "Closed"].includes(ticket.status);
    if (status !== undefined) {
      ticket.status = status;
      if (["Resolved", "Closed"].includes(status) && !ticket.resolvedAt) {
        ticket.resolvedAt = new Date();
      }
    }
    await ticket.save();

    const nowResolved = ["Resolved", "Closed"].includes(ticket.status);
    if (!wasResolved && nowResolved && ticket.raisedByEmail) {
      try {
        await sendEmail({
          to: ticket.raisedByEmail,
          subject: `[${ticket.ticketId}] Your request has been ${ticket.status.toLowerCase()}`,
          text: `Hi ${ticket.raisedByName}, your request "${ticket.subject}" is now ${ticket.status}.${
            ticket.resolution ? ` Resolution: ${ticket.resolution}` : ""
          }`,
          html: `<p>Hi ${ticket.raisedByName},</p><p>Your request "<strong>${ticket.subject}</strong>" is now <strong>${ticket.status}</strong>.</p>${
            ticket.resolution ? `<p>Resolution: ${ticket.resolution}</p>` : ""
          }`,
        });
      } catch (err) {
        logger.error(`Ticket resolution email failed: ${err.message}`);
      }
    }

    res.status(200).json({ message: "Ticket updated", ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { message, by } = req.body;
    if (!message) return res.status(400).json({ message: "message is required" });
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { message, by: by || "HR", at: new Date() } } },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json({ message: "Comment added", ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json({ message: "Ticket deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helpdesk dashboard stats.
exports.getStats = async (req, res) => {
  try {
    const all = await Ticket.find();
    const now = new Date();
    const openish = all.filter((t) => ["Open", "In Progress"].includes(t.status));
    const byCategory = {};
    all.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });
    res.status(200).json({
      total: all.length,
      open: all.filter((t) => t.status === "Open").length,
      inProgress: all.filter((t) => t.status === "In Progress").length,
      resolved: all.filter((t) => t.status === "Resolved").length,
      closed: all.filter((t) => t.status === "Closed").length,
      overdue: openish.filter((t) => t.dueAt && t.dueAt < now).length,
      byCategory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
