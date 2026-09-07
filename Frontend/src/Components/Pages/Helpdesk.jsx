import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTickets,
  fetchTicketStats,
  createTicket,
  updateTicket,
  addTicketComment,
} from "../../redux/Slices/TicketSlice";
import styles from "./Helpdesk.module.css";

const CATEGORIES = ["Payroll", "Leave", "IT", "Benefits", "Facilities", "General"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

const EMPTY = {
  subject: "",
  description: "",
  category: "General",
  priority: "Medium",
  raisedByName: "",
  raisedByEmail: "",
};

const isOverdue = (t) =>
  ["Open", "In Progress"].includes(t.status) &&
  t.dueAt &&
  new Date(t.dueAt).getTime() < Date.now();

function Helpdesk() {
  const dispatch = useDispatch();
  const { items, stats, loading } = useSelector((state) => state.ticket);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [filter, setFilter] = useState({ status: "", priority: "", category: "" });
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    dispatch(fetchTickets(filter));
    dispatch(fetchTicketStats());
  }, [dispatch, filter]);

  const current = selected
    ? items.find((t) => t._id === selected._id) || selected
    : null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.raisedByName) return;
    await dispatch(createTicket(form));
    dispatch(fetchTicketStats());
    setForm(EMPTY);
    setShowForm(false);
  };

  const changeStatus = async (t, status) => {
    await dispatch(updateTicket({ id: t._id, data: { status } }));
    dispatch(fetchTicketStats());
  };

  const changeField = async (t, data) => {
    await dispatch(updateTicket({ id: t._id, data }));
    dispatch(fetchTicketStats());
  };

  const handleComment = async () => {
    if (!comment.trim() || !current) return;
    await dispatch(addTicketComment({ id: current._id, message: comment.trim(), by: "HR" }));
    setComment("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1>HR Helpdesk</h1>
          <p className={styles.subtitle}>
            Employee requests with priority-based SLAs, auto-acknowledgement, and a full
            resolution trail.
          </p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New Ticket"}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.open}</span>
            <span className={styles.statLabel}>Open</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.inProgress}</span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.resolved}</span>
            <span className={styles.statLabel}>Resolved</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${stats.overdue ? styles.danger : ""}`}>
              {stats.overdue}
            </span>
            <span className={styles.statLabel}>SLA Breached</span>
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form className={styles.form} onSubmit={handleCreate}>
          <div className={styles.formRow}>
            <input
              type="text"
              placeholder="Subject *"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
          </div>
          <textarea
            placeholder="Describe the request..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className={styles.formRow}>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className={styles.formRow}>
            <input
              type="text"
              placeholder="Your name *"
              value={form.raisedByName}
              onChange={(e) => setForm({ ...form, raisedByName: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Your email"
              value={form.raisedByEmail}
              onChange={(e) => setForm({ ...form, raisedByEmail: e.target.value })}
            />
          </div>
          <button type="submit" className={styles.submitBtn}>
            Submit ticket
          </button>
        </form>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Ticket table */}
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p className={styles.muted}>No tickets match.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Raised by</th>
                <th>SLA</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id} onClick={() => setSelected(t)} className={styles.row}>
                  <td className={styles.mono}>{t.ticketId}</td>
                  <td>{t.subject}</td>
                  <td>{t.category}</td>
                  <td>
                    <span className={`${styles.pri} ${styles["p_" + t.priority]}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.status} ${styles["st_" + t.status.replace(/\s/g, "")]}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>{t.raisedByName}</td>
                  <td className={isOverdue(t) ? styles.danger : ""}>
                    {t.dueAt ? new Date(t.dueAt).toLocaleDateString() : "—"}
                    {isOverdue(t) && " ⚠"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail drawer */}
      {current && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div>
                <h2>
                  <span className={styles.mono}>{current.ticketId}</span> · {current.subject}
                </h2>
                <p>
                  {current.category} · raised by {current.raisedByName}
                  {current.raisedByEmail ? ` (${current.raisedByEmail})` : ""}
                </p>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>

            {current.description && (
              <p className={styles.desc}>{current.description}</p>
            )}

            <div className={styles.controls}>
              <label>
                Status
                <select
                  value={current.status}
                  onChange={(e) => changeStatus(current, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Priority
                <select
                  value={current.priority}
                  onChange={(e) => changeField(current, { priority: e.target.value })}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label>
                Assignee
                <input
                  type="text"
                  defaultValue={current.assignedTo}
                  placeholder="Unassigned"
                  onBlur={(e) => changeField(current, { assignedTo: e.target.value })}
                />
              </label>
            </div>

            <div className={styles.slaLine}>
              SLA due:{" "}
              <span className={isOverdue(current) ? styles.danger : ""}>
                {current.dueAt ? new Date(current.dueAt).toLocaleString() : "—"}
              </span>
              {current.resolvedAt && (
                <span> · Resolved {new Date(current.resolvedAt).toLocaleString()}</span>
              )}
            </div>

            <label className={styles.resLabel}>
              Resolution note
              <textarea
                defaultValue={current.resolution}
                placeholder="What was done to resolve this..."
                onBlur={(e) => changeField(current, { resolution: e.target.value })}
              />
            </label>

            <h4>Comments</h4>
            <div className={styles.comments}>
              {(current.comments || []).map((c, i) => (
                <div key={i} className={styles.comment}>
                  <div>{c.message}</div>
                  <div className={styles.commentMeta}>
                    {c.by || "HR"} · {new Date(c.at).toLocaleString()}
                  </div>
                </div>
              ))}
              {(!current.comments || current.comments.length === 0) && (
                <p className={styles.muted}>No comments yet.</p>
              )}
            </div>
            <div className={styles.addComment}>
              <input
                type="text"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
              />
              <button onClick={handleComment}>Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Helpdesk;
