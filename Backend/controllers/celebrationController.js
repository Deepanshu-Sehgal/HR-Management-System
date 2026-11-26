const Employee = require("../models/Employee");
const Celebration = require("../models/Celebration");
const { sendEmail } = require("../utils/email");
const logger = require("../utils/logger");

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

// Parse a stored date value (Date or string) into a Date, or null if invalid.
function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

// Next occurrence (>= today) of a recurring month/day anniversary.
// `source` is the original date (birth / joining); month & day are reused and
// only the year is advanced. Feb 29 on a non-leap year rolls to Mar 1, which is
// acceptable for greeting purposes.
function nextOccurrence(source, today) {
  const month = source.getMonth();
  const day = source.getDate();
  let occ = new Date(today.getFullYear(), month, day);
  occ.setHours(0, 0, 0, 0);
  if (occ < today) {
    occ = new Date(today.getFullYear() + 1, month, day);
    occ.setHours(0, 0, 0, 0);
  }
  return occ;
}

function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

// Build the full list of upcoming celebration events for the given employees
// within `windowDays` days from today. Each event is a plain object the
// frontend can render directly.
function buildEvents(employees, windowDays) {
  const today = startOfToday();
  const events = [];

  for (const emp of employees) {
    // Birthdays come from dateOfBirth.
    const dob = parseDate(emp.dateOfBirth);
    if (dob) {
      const occ = nextOccurrence(dob, today);
      const days = daysBetween(today, occ);
      if (days <= windowDays) {
        events.push({
          employeeId: emp._id,
          employeeName: emp.employeeName,
          email: emp.email || "",
          department: emp.department || "",
          position: emp.position || "",
          image: emp.image || "",
          type: "birthday",
          date: occ,
          daysUntil: days,
          turningAge: occ.getFullYear() - dob.getFullYear(),
        });
      }
    }

    // Work anniversaries come from the joining date (`date`).
    const joined = parseDate(emp.date);
    if (joined) {
      const occ = nextOccurrence(joined, today);
      const days = daysBetween(today, occ);
      const years = occ.getFullYear() - joined.getFullYear();
      // Only celebrate completed years of service (1+).
      if (days <= windowDays && years >= 1) {
        events.push({
          employeeId: emp._id,
          employeeName: emp.employeeName,
          email: emp.email || "",
          department: emp.department || "",
          position: emp.position || "",
          image: emp.image || "",
          type: "anniversary",
          date: occ,
          daysUntil: days,
          years,
        });
      }
    }
  }

  // Soonest first; break ties by name.
  events.sort(
    (a, b) =>
      a.daysUntil - b.daysUntil ||
      (a.employeeName || "").localeCompare(b.employeeName || "")
  );
  return events;
}

// ---------------------------------------------------------------------------
// Email composition
// ---------------------------------------------------------------------------

function composeGreeting(event) {
  const name = event.employeeName || "there";
  if (event.type === "birthday") {
    return {
      subject: `🎂 Happy Birthday, ${name}!`,
      text: `Hi ${name}, the whole team wishes you a very happy birthday! We hope your day is filled with joy and celebration. Thank you for being part of the team.`,
      html: `<p>Hi ${name},</p><p>🎉 The whole team wishes you a very <strong>happy birthday</strong>! We hope your day is filled with joy and celebration.</p><p>Thank you for being a valued part of the team. 🎂</p>`,
    };
  }
  const yr = event.years;
  const yrLabel = `${yr} year${yr === 1 ? "" : "s"}`;
  return {
    subject: `🎉 Happy ${yrLabel} work anniversary, ${name}!`,
    text: `Hi ${name}, congratulations on ${yrLabel} with us! Thank you for your dedication and all the contributions you've made. Here's to many more.`,
    html: `<p>Hi ${name},</p><p>🎉 Congratulations on <strong>${yrLabel}</strong> with us! Thank you for your dedication and all the contributions you've made along the way.</p><p>Here's to many more. 🥳</p>`,
  };
}

// ---------------------------------------------------------------------------
// Controller endpoints
// ---------------------------------------------------------------------------

// GET /api/celebrations/upcoming?days=30
// Returns upcoming birthdays + work anniversaries within the window, plus a
// summary used for the dashboard stat tiles.
exports.getUpcoming = async (req, res) => {
  try {
    const windowDays = Math.min(
      Math.max(parseInt(req.query.days, 10) || 30, 1),
      366
    );
    const employees = await Employee.find(
      {},
      "employeeName email department position image date dateOfBirth"
    );
    const events = buildEvents(employees, windowDays);

    const summary = {
      windowDays,
      total: events.length,
      today: events.filter((e) => e.daysUntil === 0).length,
      thisWeek: events.filter((e) => e.daysUntil >= 0 && e.daysUntil <= 7)
        .length,
      birthdays: events.filter((e) => e.type === "birthday").length,
      anniversaries: events.filter((e) => e.type === "anniversary").length,
    };

    res.status(200).json({ events, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/celebrations/log — recently sent greetings (most recent first).
exports.getLog = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const log = await Celebration.find().sort({ sentAt: -1 }).limit(limit);
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/celebrations/send
// Manually send (or re-record) a greeting for one employee.
// Body: { employeeId, type: "birthday" | "anniversary" }
exports.sendGreeting = async (req, res) => {
  try {
    const { employeeId, type } = req.body;
    if (!employeeId || !["birthday", "anniversary"].includes(type)) {
      return res
        .status(400)
        .json({ message: "employeeId and a valid type are required" });
    }

    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    const today = startOfToday();
    const source =
      type === "birthday" ? parseDate(emp.dateOfBirth) : parseDate(emp.date);
    if (!source) {
      return res.status(400).json({
        message:
          type === "birthday"
            ? "This employee has no date of birth on file"
            : "This employee has no joining date on file",
      });
    }
    const occ = nextOccurrence(source, today);
    const years = type === "anniversary" ? occ.getFullYear() - source.getFullYear() : 0;
    const event = {
      employeeName: emp.employeeName,
      type,
      years,
      turningAge: type === "birthday" ? occ.getFullYear() - source.getFullYear() : 0,
    };

    let status = "sent";
    if (emp.email) {
      try {
        const msg = composeGreeting(event);
        await sendEmail({ to: emp.email, ...msg });
      } catch (err) {
        logger.error(`Celebration email failed: ${err.message}`);
        status = "skipped";
      }
    } else {
      status = "skipped";
    }

    // Record / upsert the log for this year so the sweep won't duplicate it.
    const year = occ.getFullYear();
    const record = await Celebration.findOneAndUpdate(
      { employee: emp._id, type, year },
      {
        employee: emp._id,
        employeeName: emp.employeeName,
        type,
        year,
        years,
        emailedTo: emp.email || "",
        status,
        sentAt: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message:
        status === "sent"
          ? "Greeting sent"
          : "Recorded, but no email was sent (no address on file)",
      record,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Core automation: find today's birthdays & anniversaries and email a greeting
// to each, exactly once per employee per type per year. Safe to call on an
// interval. Returns a small summary for logging.
exports.runCelebrationSweep = async () => {
  const today = startOfToday();
  const employees = await Employee.find(
    {},
    "employeeName email date dateOfBirth"
  );
  // Only today's events.
  const todays = buildEvents(employees, 0).filter((e) => e.daysUntil === 0);

  let sent = 0;
  let skipped = 0;

  for (const event of todays) {
    const year = event.date.getFullYear();
    // Reserve the slot first; the unique index makes this atomic across runs.
    try {
      await Celebration.create({
        employee: event.employeeId,
        employeeName: event.employeeName,
        type: event.type,
        year,
        years: event.type === "anniversary" ? event.years : 0,
        emailedTo: event.email || "",
        status: event.email ? "sent" : "skipped",
      });
    } catch (err) {
      // Duplicate key → already greeted this year; move on.
      if (err && err.code === 11000) continue;
      logger.error(`Celebration log write failed: ${err.message}`);
      continue;
    }

    if (!event.email) {
      skipped += 1;
      continue;
    }

    try {
      const msg = composeGreeting(event);
      await sendEmail({ to: event.email, ...msg });
      sent += 1;
    } catch (err) {
      logger.error(`Celebration greeting email failed: ${err.message}`);
      // Mark the already-created record as skipped so it's visible in the log.
      await Celebration.findOneAndUpdate(
        { employee: event.employeeId, type: event.type, year },
        { status: "skipped" }
      ).catch(() => {});
      skipped += 1;
    }
  }

  if (todays.length) {
    logger.info(
      `Celebration sweep: ${sent} greeting(s) sent, ${skipped} skipped (${todays.length} occasion(s) today)`
    );
  }
  return { occasions: todays.length, sent, skipped };
};

// POST /api/celebrations/run-sweep — manual trigger for the sweep above.
exports.runSweep = async (req, res) => {
  try {
    const result = await exports.runCelebrationSweep();
    res.status(200).json({ message: "Celebration sweep complete", ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
