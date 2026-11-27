import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUpcomingCelebrations,
  fetchCelebrationLog,
  sendCelebrationGreeting,
  runCelebrationSweep,
} from "../../redux/Slices/CelebrationSlice";
import styles from "./Celebrations.module.css";

const WINDOWS = [
  { label: "Next 7 days", value: 7 },
  { label: "Next 30 days", value: 30 },
  { label: "Next 90 days", value: 90 },
  { label: "Whole year", value: 366 },
];

const typeMeta = {
  birthday: { icon: "🎂", label: "Birthday", cls: "birthday" },
  anniversary: { icon: "🎉", label: "Work Anniversary", cls: "anniversary" },
};

const whenLabel = (days) => {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
};

function Celebrations() {
  const dispatch = useDispatch();
  const { events, summary, log, loading, sending } = useSelector(
    (state) => state.celebrations
  );

  const [days, setDays] = useState(30);
  const [filter, setFilter] = useState("all"); // all | birthday | anniversary
  const [showLog, setShowLog] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    dispatch(fetchUpcomingCelebrations(days));
  }, [dispatch, days]);

  const visible = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3500);
  };

  const handleSend = async (ev) => {
    const res = await dispatch(
      sendCelebrationGreeting({ employeeId: ev.employeeId, type: ev.type })
    );
    if (sendCelebrationGreeting.fulfilled.match(res)) {
      flash(res.payload.message || "Greeting sent");
      if (showLog) dispatch(fetchCelebrationLog());
    } else {
      flash("Could not send greeting");
    }
  };

  const handleSweep = async () => {
    const res = await dispatch(runCelebrationSweep());
    if (runCelebrationSweep.fulfilled.match(res)) {
      const { sent, skipped, occasions } = res.payload;
      flash(
        `Sweep done — ${sent} sent, ${skipped} skipped of ${occasions} occasion(s) today`
      );
      dispatch(fetchUpcomingCelebrations(days));
      if (showLog) dispatch(fetchCelebrationLog());
    } else {
      flash("Sweep failed");
    }
  };

  const toggleLog = () => {
    const next = !showLog;
    setShowLog(next);
    if (next) dispatch(fetchCelebrationLog());
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1>Employee Celebrations</h1>
          <p className={styles.subtitle}>
            Never miss a birthday or work anniversary — greetings are emailed
            automatically each day, and you can send one any time.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.ghostBtn} onClick={toggleLog}>
            {showLog ? "Hide sent log" : "📜 Sent log"}
          </button>
          <button className={styles.addBtn} onClick={handleSweep}>
            ✉️ Send today's greetings
          </button>
        </div>
      </div>

      {notice && <div className={styles.notice}>{notice}</div>}

      {/* Stats */}
      {summary && (
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{summary.today}</span>
            <span className={styles.statLabel}>Today</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{summary.thisWeek}</span>
            <span className={styles.statLabel}>This Week</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{summary.birthdays}</span>
            <span className={styles.statLabel}>Birthdays</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{summary.anniversaries}</span>
            <span className={styles.statLabel}>Anniversaries</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{summary.total}</span>
            <span className={styles.statLabel}>Total Upcoming</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.segment}>
          {["all", "birthday", "anniversary"].map((f) => (
            <button
              key={f}
              className={`${styles.segBtn} ${filter === f ? styles.segActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : typeMeta[f].label + "s"}
            </button>
          ))}
        </div>
        <select
          className={styles.windowSelect}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          {WINDOWS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sent log */}
      {showLog && (
        <div className={styles.logPanel}>
          <h3>Recently sent greetings</h3>
          {log.length === 0 ? (
            <p className={styles.muted}>No greetings recorded yet.</p>
          ) : (
            <table className={styles.logTable}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Occasion</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Sent</th>
                </tr>
              </thead>
              <tbody>
                {log.map((l) => (
                  <tr key={l._id}>
                    <td>{l.employeeName}</td>
                    <td>
                      {typeMeta[l.type]?.icon} {typeMeta[l.type]?.label}
                      {l.type === "anniversary" && l.years
                        ? ` (${l.years}y)`
                        : ""}
                    </td>
                    <td>{l.year}</td>
                    <td>
                      <span
                        className={`${styles.logStatus} ${
                          l.status === "sent" ? styles.sent : styles.skipped
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td>{new Date(l.sentAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <p>Loading...</p>
      ) : visible.length === 0 ? (
        <p className={styles.muted}>
          No upcoming celebrations in this window. Add dates of birth and
          joining dates to employee records to start tracking them.
        </p>
      ) : (
        <div className={styles.grid}>
          {visible.map((ev) => {
            const meta = typeMeta[ev.type];
            const busy = sending === `${ev.employeeId}-${ev.type}`;
            return (
              <div
                key={`${ev.employeeId}-${ev.type}`}
                className={`${styles.card} ${styles[meta.cls]} ${
                  ev.daysUntil === 0 ? styles.todayCard : ""
                }`}
              >
                <div className={styles.cardTop}>
                  <span className={styles.icon}>{meta.icon}</span>
                  <span
                    className={`${styles.whenPill} ${
                      ev.daysUntil === 0
                        ? styles.whenToday
                        : ev.daysUntil <= 7
                        ? styles.whenSoon
                        : ""
                    }`}
                  >
                    {whenLabel(ev.daysUntil)}
                  </span>
                </div>
                <strong className={styles.name}>{ev.employeeName}</strong>
                <div className={styles.cardSub}>
                  {ev.position || "—"}
                  {ev.department ? ` · ${ev.department}` : ""}
                </div>
                <div className={styles.occasion}>
                  {ev.type === "birthday"
                    ? `Birthday${ev.turningAge ? ` · turning ${ev.turningAge}` : ""}`
                    : `${ev.years} year${ev.years === 1 ? "" : "s"} of service`}
                  <span className={styles.date}>
                    {new Date(ev.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <button
                  className={styles.sendBtn}
                  disabled={busy || !ev.email}
                  title={ev.email ? "" : "No email address on file"}
                  onClick={() => handleSend(ev)}
                >
                  {busy ? "Sending..." : "Send greeting"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Celebrations;
