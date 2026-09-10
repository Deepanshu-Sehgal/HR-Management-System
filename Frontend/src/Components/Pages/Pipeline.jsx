import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ensureDefaultPipeline,
  fetchBoard,
  fetchFunnel,
  fetchOverdue,
  moveStage,
  enrollApplication,
  addActivity,
  updateApplicationMeta,
  runSlaSweep,
  addTask,
  updateTask,
  deleteTask,
  fetchTasks,
  aiScoreLead,
  aiPrioritizeLeads,
  aiDraftLeadEmail,
} from "../../redux/Slices/PipelineSlice";
import { fetchJobApplications } from "../../redux/Slices/JobApplicationSlice";
import {
  fetchUpcomingInterviews,
  fetchInterviewsByApplication,
  scheduleInterview,
  cancelInterview,
  updateInterview,
} from "../../redux/Slices/InterviewSlice";
import {
  fetchOffersByApplication,
  createOffer,
  sendOffer,
  respondOffer,
  deleteOffer,
} from "../../redux/Slices/OfferSlice";
import styles from "./Pipeline.module.css";

const isOverdue = (dueAt) => dueAt && new Date(dueAt).getTime() < Date.now();

const EMPTY_INTERVIEW = {
  scheduledAt: "",
  durationMins: 45,
  mode: "Video",
  location: "",
  interviewer: "",
  round: "Interview",
};

const EMPTY_TASK = { title: "", assignedTo: "", dueDate: "", priority: "Medium" };

const EMPTY_OFFER = {
  salary: "",
  currency: "USD",
  joiningDate: "",
  expiryDate: "",
  notes: "",
  send: true,
};

const openTaskCount = (app) => (app.tasks || []).filter((t) => !t.done).length;

function daysInStage(stageEnteredAt) {
  if (!stageEnteredAt) return null;
  const ms = Date.now() - new Date(stageEnteredAt).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function Pipeline() {
  const dispatch = useDispatch();
  const { activePipeline, columns, funnel, overdue, loading, moving, lastSweep } =
    useSelector((state) => state.pipeline);
  const { applications } = useSelector((state) => state.jobApplication);
  const { upcoming, byApplication } = useSelector((state) => state.interview);
  const { tasks } = useSelector((state) => state.pipeline);
  const offersByApp = useSelector((state) => state.offer.byApplication);

  const [selected, setSelected] = useState(null); // application in detail drawer
  const [note, setNote] = useState("");
  const [sweeping, setSweeping] = useState(false);
  const [search, setSearch] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [fitFilter, setFitFilter] = useState(""); // "", Strong, Moderate, Weak
  const [sortBy, setSortBy] = useState(""); // "", ai, sla, stage, rating
  const [emailCopied, setEmailCopied] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [dragId, setDragId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [ivForm, setIvForm] = useState(EMPTY_INTERVIEW);
  const [feedbackFor, setFeedbackFor] = useState(null); // interview id being reviewed
  const [fbForm, setFbForm] = useState({ status: "Completed", rating: 0, feedback: "" });
  const [showTasks, setShowTasks] = useState(false); // task tracker panel
  const [taskForm, setTaskForm] = useState(EMPTY_TASK);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerForm, setOfferForm] = useState(EMPTY_OFFER);
  const [aiScoring, setAiScoring] = useState(false);
  const [aiPrioritizing, setAiPrioritizing] = useState(false);
  const [emailDraft, setEmailDraft] = useState(null); // { subject, body } | null
  const [emailBusy, setEmailBusy] = useState(false);

  const pipelineId = activePipeline?._id;

  // Bootstrap: ensure a default pipeline, then load its board + job applications.
  useEffect(() => {
    dispatch(ensureDefaultPipeline());
    dispatch(fetchJobApplications());
    dispatch(fetchUpcomingInterviews());
  }, [dispatch]);

  // When a candidate drawer opens, load that candidate's interviews + offers.
  useEffect(() => {
    if (selected?._id) {
      dispatch(fetchInterviewsByApplication(selected._id));
      dispatch(fetchOffersByApplication(selected._id));
      setShowSchedule(false);
      setIvForm(EMPTY_INTERVIEW);
      setShowOfferForm(false);
      setOfferForm(EMPTY_OFFER);
      setEmailDraft(null);
      setTagInput("");
    }
  }, [dispatch, selected?._id]);

  // Close the candidate drawer on Escape.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  useEffect(() => {
    if (pipelineId) {
      dispatch(fetchBoard(pipelineId));
      dispatch(fetchFunnel(pipelineId));
      dispatch(fetchOverdue(pipelineId));
      dispatch(fetchTasks({ pipelineId, open: "true" }));
    }
  }, [dispatch, pipelineId]);

  const stageOptions = useMemo(
    () => columns.map((c) => ({ key: c.key, name: c.name })),
    [columns]
  );

  // Applications not yet enrolled in any pipeline (available to add to the board).
  const unenrolled = useMemo(
    () => (applications || []).filter((a) => !a.pipelineId),
    [applications]
  );

  const refresh = () => {
    if (!pipelineId) return;
    dispatch(fetchBoard(pipelineId));
    dispatch(fetchFunnel(pipelineId));
    dispatch(fetchOverdue(pipelineId));
  };

  const handleMove = async (application, stageKey) => {
    if (!stageKey || stageKey === application.stageKey) return;
    await dispatch(moveStage({ applicationId: application._id, stageKey, by: "HR" }));
    dispatch(fetchFunnel(pipelineId));
    dispatch(fetchOverdue(pipelineId));
  };

  const handleEnroll = async (application) => {
    await dispatch(
      enrollApplication({ applicationId: application._id, pipelineId, by: "HR" })
    );
    dispatch(fetchJobApplications());
    refresh();
  };

  const handleAddNote = async () => {
    if (!note.trim() || !selected) return;
    const res = await dispatch(
      addActivity({ applicationId: selected._id, message: note.trim(), by: "HR", type: "note" })
    );
    if (res.payload) setSelected(res.payload);
    setNote("");
  };

  // Assign / reassign the recruiter owner (saved on blur).
  const handleAssign = async (value) => {
    if (!selected || value === (selected.assignedTo || "")) return;
    const res = await dispatch(
      updateApplicationMeta({ applicationId: selected._id, assignedTo: value })
    );
    if (res.payload) setSelected(res.payload);
  };

  const handleAddTag = async () => {
    const tag = tagInput.trim();
    if (!tag || !selected) return;
    const next = [...new Set([...(selected.tags || []), tag])];
    setTagInput("");
    const res = await dispatch(
      updateApplicationMeta({ applicationId: selected._id, tags: next })
    );
    if (res.payload) setSelected(res.payload);
  };

  const handleRemoveTag = async (tag) => {
    if (!selected) return;
    const next = (selected.tags || []).filter((t) => t !== tag);
    const res = await dispatch(
      updateApplicationMeta({ applicationId: selected._id, tags: next })
    );
    if (res.payload) setSelected(res.payload);
  };

  const handleSweep = async () => {
    setSweeping(true);
    await dispatch(runSlaSweep());
    refresh();
    setSweeping(false);
  };

  // Refresh the open-task tracker after any task change.
  const refreshTasks = () => {
    if (pipelineId) dispatch(fetchTasks({ pipelineId, open: "true" }));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !selected) return;
    const res = await dispatch(
      addTask({ applicationId: selected._id, ...taskForm, by: "HR" })
    );
    if (res.payload) setSelected(res.payload);
    setTaskForm(EMPTY_TASK);
    refreshTasks();
  };

  const handleToggleTask = async (task) => {
    if (!selected) return;
    const res = await dispatch(
      updateTask({ applicationId: selected._id, taskId: task._id, done: !task.done, by: "HR" })
    );
    if (res.payload) setSelected(res.payload);
    refreshTasks();
  };

  const handleDeleteTask = async (task) => {
    if (!selected) return;
    const res = await dispatch(
      deleteTask({ applicationId: selected._id, taskId: task._id })
    );
    if (res.payload) setSelected(res.payload);
    refreshTasks();
  };

  // Open the candidate drawer for a task in the tracker panel.
  const openCandidateForTask = (t) => {
    for (const col of columns) {
      const app = col.applications.find((a) => a._id === t.applicationId);
      if (app) {
        setSelected(app);
        return;
      }
    }
  };

  // ---- Offers ----
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!selected || !offerForm.salary) return;
    await dispatch(
      createOffer({
        applicationId: selected._id,
        department: selected.department || "",
        ...offerForm,
        salary: Number(offerForm.salary) || 0,
        createdBy: "HR",
      })
    );
    setShowOfferForm(false);
    setOfferForm(EMPTY_OFFER);
  };

  const handleSendOffer = async (id) => {
    await dispatch(sendOffer(id));
  };

  const handleRespondOffer = async (id, status) => {
    await dispatch(respondOffer({ id, status, by: "HR" }));
    // Acceptance advances the candidate + spawns onboarding server-side.
    if (status === "Accepted") refresh();
  };

  const handleDeleteOffer = async (id) => {
    await dispatch(deleteOffer({ id }));
  };

  // ---- AI lead management ----
  const handleAiScore = async () => {
    if (!selected) return;
    setAiScoring(true);
    const res = await dispatch(aiScoreLead(selected._id));
    if (res.payload && res.payload._id) setSelected(res.payload);
    setAiScoring(false);
  };

  const handleAiPrioritize = async () => {
    if (!pipelineId) return;
    setAiPrioritizing(true);
    await dispatch(aiPrioritizeLeads({ pipelineId }));
    refresh();
    setAiPrioritizing(false);
  };

  const handleAiEmail = async () => {
    if (!selected) return;
    setEmailBusy(true);
    setEmailDraft(null);
    const res = await dispatch(aiDraftLeadEmail({ applicationId: selected._id }));
    if (res.payload) setEmailDraft(res.payload);
    setEmailCopied(false);
    setEmailBusy(false);
  };

  const handleCopyEmail = async () => {
    if (!emailDraft) return;
    const text = `Subject: ${emailDraft.subject}\n\n${emailDraft.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — no-op.
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selected || !ivForm.scheduledAt) return;
    await dispatch(
      scheduleInterview({
        applicationId: selected._id,
        ...ivForm,
        durationMins: Number(ivForm.durationMins) || 45,
        createdBy: "HR",
      })
    );
    // Refresh the candidate's activity timeline (interview logs a system entry).
    dispatch(fetchInterviewsByApplication(selected._id));
    setShowSchedule(false);
    setIvForm(EMPTY_INTERVIEW);
  };

  const handleCancelInterview = async (id) => {
    await dispatch(cancelInterview(id));
    if (selected?._id) dispatch(fetchInterviewsByApplication(selected._id));
  };

  const openFeedback = (iv) => {
    setFeedbackFor(iv._id);
    setFbForm({
      status: iv.status === "Scheduled" ? "Completed" : iv.status,
      rating: iv.rating || 0,
      feedback: iv.feedback || "",
    });
  };

  const handleSaveFeedback = async (id) => {
    await dispatch(
      updateInterview({
        id,
        data: {
          status: fbForm.status,
          rating: Number(fbForm.rating) || 0,
          feedback: fbForm.feedback,
          updatedBy: "HR",
        },
      })
    );
    setFeedbackFor(null);
    if (selected?._id) dispatch(fetchInterviewsByApplication(selected._id));
  };

  // Apply the search + overdue-only filters to a column's cards.
  const filterApps = (apps) =>
    apps.filter((a) => {
      if (overdueOnly && !isOverdue(a.dueAt)) return false;
      if (fitFilter && a.aiFit !== fitFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (a.applicantName || "").toLowerCase().includes(q) ||
          (a.jobTitle || "").toLowerCase().includes(q)
        );
      }
      return true;
    });

  // Sort a column's cards by the selected key (default keeps backend order).
  const sortApps = (apps) => {
    if (!sortBy) return apps;
    const arr = [...apps];
    const num = (v) => (typeof v === "number" ? v : -Infinity);
    const time = (v) => (v ? new Date(v).getTime() : Infinity);
    arr.sort((a, b) => {
      switch (sortBy) {
        case "ai":
          return num(b.aiScore) - num(a.aiScore); // highest fit first
        case "sla":
          return time(a.dueAt) - time(b.dueAt); // soonest due first
        case "stage":
          return time(a.stageEnteredAt) - time(b.stageEnteredAt); // longest in stage first
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });
    return arr;
  };

  // Export the currently-visible (filtered) leads across all columns to CSV.
  const exportCsv = () => {
    const cols = [
      "Name",
      "Job Title",
      "Stage",
      "Assigned To",
      "AI Score",
      "AI Fit",
      "Rating",
      "Days In Stage",
      "Open Tasks",
      "SLA Due",
      "Email",
      "Phone",
    ];
    const esc = (v) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = [];
    columns.forEach((col) => {
      filterApps(col.applications).forEach((a) => {
        rows.push([
          a.applicantName,
          a.jobTitle,
          col.name,
          a.assignedTo || "",
          typeof a.aiScore === "number" ? a.aiScore : "",
          a.aiFit || "",
          a.rating || "",
          a.stageEnteredAt != null ? daysInStage(a.stageEnteredAt) : "",
          openTaskCount(a),
          a.dueAt ? new Date(a.dueAt).toLocaleDateString() : "",
          a.email || "",
          a.phoneNumber || "",
        ]);
      });
    });
    const csv = [cols, ...rows].map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const name = (activePipeline?.name || "pipeline").replace(/\s+/g, "-").toLowerCase();
    link.download = `${name}-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---- Native drag & drop between columns ----
  const findApp = (id) => {
    for (const col of columns) {
      const found = col.applications.find((a) => a._id === id);
      if (found) return found;
    }
    return null;
  };

  const onDragStart = (e, app) => {
    setDragId(app._id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOverCol = (e, key) => {
    e.preventDefault();
    if (dragOverCol !== key) setDragOverCol(key);
  };

  const onDropCol = async (e, col) => {
    e.preventDefault();
    const app = findApp(dragId);
    setDragOverCol(null);
    setDragId(null);
    if (app && app.stageKey !== col.key) {
      await handleMove(app, col.key);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1>Recruitment Pipeline</h1>
          <p className={styles.subtitle}>
            {activePipeline?.name || "Loading pipeline..."} — drag candidates through
            stages; emails &amp; SLA reminders fire automatically.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.aiBtn}
            onClick={handleAiPrioritize}
            disabled={aiPrioritizing}
            title="Score all un-scored active leads with AI"
          >
            {aiPrioritizing ? "Scoring…" : "✨ AI Prioritize"}
          </button>
          <button
            className={styles.tasksBtn}
            onClick={() => setShowTasks((s) => !s)}
          >
            ✓ Tasks
            {tasks.length > 0 && <span className={styles.taskCountPill}>{tasks.length}</span>}
          </button>
          <button className={styles.sweepBtn} onClick={handleSweep} disabled={sweeping}>
            {sweeping ? "Running..." : "⚙ Run Automation Now"}
          </button>
        </div>
      </div>

      {/* Task tracker: all open tasks across the pipeline */}
      {showTasks && (
        <div className={styles.taskTracker}>
          <div className={styles.taskTrackerHead}>
            <strong>Open tasks ({tasks.length})</strong>
            <button className={styles.closeInline} onClick={() => setShowTasks(false)}>
              ✕
            </button>
          </div>
          {tasks.length === 0 ? (
            <p className={styles.muted}>No open tasks. 🎉</p>
          ) : (
            <table className={styles.taskTable}>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Candidate</th>
                  <th>Priority</th>
                  <th>Due</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr
                    key={t._id}
                    className={`${styles.taskRow} ${t.overdue ? styles.taskRowOverdue : ""}`}
                    onClick={() => openCandidateForTask(t)}
                  >
                    <td>{t.title}</td>
                    <td>
                      {t.applicantName}
                      <span className={styles.taskJob}> · {t.jobTitle}</span>
                    </td>
                    <td>
                      <span className={`${styles.tprio} ${styles["tp_" + t.priority]}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className={t.overdue ? styles.danger : ""}>
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                      {t.overdue && " ⚠"}
                    </td>
                    <td>{t.assignedTo || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {lastSweep && (
        <div className={styles.sweepResult}>
          Last automation run: scanned {lastSweep.scanned}, auto-advanced{" "}
          {lastSweep.advanced}, flagged {lastSweep.flagged}.
        </div>
      )}

      {/* Funnel analytics */}
      {funnel && (
        <div className={styles.funnelBar}>
          <div className={styles.kpi}>
            <span className={styles.kpiValue}>{funnel.total}</span>
            <span className={styles.kpiLabel}>In Pipeline</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiValue}>{funnel.hired}</span>
            <span className={styles.kpiLabel}>Hired</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiValue}>{funnel.hireRate}%</span>
            <span className={styles.kpiLabel}>Hire Rate</span>
          </div>
          <div className={styles.kpi}>
            <span className={`${styles.kpiValue} ${overdue.length ? styles.danger : ""}`}>
              {overdue.length}
            </span>
            <span className={styles.kpiLabel}>Overdue (SLA)</span>
          </div>
          <div className={styles.funnelStages}>
            {funnel.funnel.map((f) => (
              <div key={f.key} className={styles.funnelStage} title={`${f.name}: ${f.reached} reached`}>
                <span className={styles.funnelName}>{f.name}</span>
                <span className={styles.funnelCount} style={{ color: f.color }}>
                  {f.reached}
                </span>
                <span className={styles.funnelConv}>{f.conversionFromPrev}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming interviews */}
      {upcoming.length > 0 && (
        <div className={styles.upcomingBar}>
          <span className={styles.upcomingTitle}>📅 Upcoming interviews</span>
          <div className={styles.upcomingList}>
            {upcoming.slice(0, 6).map((iv) => (
              <div key={iv._id} className={styles.upcomingChip} title={iv.round}>
                <strong>{iv.candidateName}</strong>
                <span>{new Date(iv.scheduledAt).toLocaleString()}</span>
                <span className={styles.upcomingMode}>{iv.mode}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Board toolbar: search + filters */}
      <div className={styles.toolbar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="🔍 Search candidate or job title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
          />
          Overdue only
        </label>
        <select
          className={styles.fitSelect}
          value={fitFilter}
          onChange={(e) => setFitFilter(e.target.value)}
          title="Filter by AI fit"
        >
          <option value="">All AI fits</option>
          <option value="Strong">✨ Strong fit</option>
          <option value="Moderate">✨ Moderate fit</option>
          <option value="Weak">✨ Weak fit</option>
        </select>
        <select
          className={styles.fitSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          title="Sort cards within each stage"
        >
          <option value="">Sort: Newest</option>
          <option value="ai">Sort: AI score</option>
          <option value="sla">Sort: SLA due</option>
          <option value="stage">Sort: Time in stage</option>
          <option value="rating">Sort: Rating</option>
        </select>
        {(search || overdueOnly || fitFilter || sortBy) && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              setSearch("");
              setOverdueOnly(false);
              setFitFilter("");
              setSortBy("");
            }}
          >
            Clear
          </button>
        )}
        <button className={styles.exportBtn} onClick={exportCsv}>
          ⬇ Export CSV
        </button>
        <span className={styles.hint}>Tip: drag a card to another column to move it.</span>
      </div>

      {/* Kanban board */}
      {loading ? (
        <p>Loading board...</p>
      ) : (
        <div className={styles.board}>
          {columns.map((col) => {
            const visible = sortApps(filterApps(col.applications));
            return (
            <div
              key={col.key}
              className={`${styles.column} ${dragOverCol === col.key ? styles.columnDragOver : ""}`}
              onDragOver={(e) => onDragOverCol(e, col.key)}
              onDragLeave={() => setDragOverCol((k) => (k === col.key ? null : k))}
              onDrop={(e) => onDropCol(e, col)}
            >
              <div className={styles.columnHeader} style={{ borderTopColor: col.color }}>
                <span className={styles.columnName}>{col.name}</span>
                <span className={styles.columnCount}>{visible.length}</span>
                {col.overdueCount > 0 && (
                  <span className={styles.overduePill}>{col.overdueCount} late</span>
                )}
              </div>

              <div className={styles.columnBody}>
                {visible.length === 0 && (
                  <div className={styles.emptyCol}>No candidates</div>
                )}
                {visible.map((app) => (
                  <div
                    key={app._id}
                    draggable
                    onDragStart={(e) => onDragStart(e, app)}
                    onDragEnd={() => {
                      setDragId(null);
                      setDragOverCol(null);
                    }}
                    className={`${styles.card} ${isOverdue(app.dueAt) ? styles.cardOverdue : ""} ${
                      dragId === app._id ? styles.cardDragging : ""
                    }`}
                  >
                    <div className={styles.cardTop}>
                      <strong className={styles.cardName}>{app.applicantName}</strong>
                      <span className={styles.cardTopRight}>
                        {typeof app.aiScore === "number" && (
                          <span
                            className={`${styles.aiScore} ${styles["aiFit_" + (app.aiFit || "")]}`}
                            title={`AI fit: ${app.aiFit || "n/a"}`}
                          >
                            ✨ {app.aiScore}
                          </span>
                        )}
                        {app.rating > 0 && (
                          <span className={styles.rating}>★ {app.rating}</span>
                        )}
                      </span>
                    </div>
                    <div className={styles.cardJob}>{app.jobTitle}</div>
                    <div className={styles.cardMeta}>
                      {app.assignedTo && <span>👤 {app.assignedTo}</span>}
                      {app.stageEnteredAt && (
                        <span>⏱ {daysInStage(app.stageEnteredAt)}d in stage</span>
                      )}
                      {openTaskCount(app) > 0 && (
                        <span className={styles.taskBadge}>
                          ✓ {openTaskCount(app)} task{openTaskCount(app) > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {isOverdue(app.dueAt) && (
                      <div className={styles.overdueNote}>
                        SLA breached — due {new Date(app.dueAt).toLocaleDateString()}
                      </div>
                    )}
                    {app.tags?.length > 0 && (
                      <div className={styles.tags}>
                        {app.tags.map((t) => (
                          <span key={t} className={styles.tag}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className={styles.cardActions}>
                      <select
                        value={app.stageKey || ""}
                        onChange={(e) => handleMove(app, e.target.value)}
                        disabled={moving}
                        className={styles.moveSelect}
                      >
                        {stageOptions.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className={styles.detailBtn}
                        onClick={() => setSelected(app)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Enroll un-pipelined applications */}
      {unenrolled.length > 0 && (
        <div className={styles.enrollPanel}>
          <h3>Applications waiting to enter the pipeline ({unenrolled.length})</h3>
          <div className={styles.enrollGrid}>
            {unenrolled.map((app) => (
              <div key={app._id} className={styles.enrollCard}>
                <div>
                  <strong>{app.applicantName}</strong>
                  <div className={styles.cardJob}>{app.jobTitle}</div>
                </div>
                <button
                  className={styles.enrollBtn}
                  onClick={() => handleEnroll(app)}
                  disabled={!pipelineId}
                >
                  + Add to pipeline
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate detail drawer */}
      {selected && (
        <div className={styles.drawerOverlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <h2>{selected.applicantName}</h2>
                <p>{selected.jobTitle}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>

            <div className={styles.drawerMeta}>
              <span>📧 {selected.email}</span>
              <span>📞 {selected.phoneNumber}</span>
              <span>Stage: {selected.stageKey || "—"}</span>
              {selected.dueAt && (
                <span className={isOverdue(selected.dueAt) ? styles.danger : ""}>
                  SLA due: {new Date(selected.dueAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Owner + tags */}
            <div className={styles.metaEditRow}>
              <label className={styles.metaField}>
                Owner
                <input
                  type="text"
                  placeholder="Assign recruiter"
                  defaultValue={selected.assignedTo || ""}
                  key={selected._id + (selected.assignedTo || "")}
                  onBlur={(e) => handleAssign(e.target.value.trim())}
                />
              </label>
              <div className={styles.metaField}>
                Tags
                <div className={styles.tagEditor}>
                  {(selected.tags || []).map((t) => (
                    <span key={t} className={styles.tagChip}>
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        title="Remove tag"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className={styles.tagInput}
                    placeholder="+ tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    onBlur={handleAddTag}
                  />
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className={styles.sectionHead}>
              <h4>✨ AI Insights</h4>
              <button
                className={styles.aiSmallBtn}
                onClick={handleAiScore}
                disabled={aiScoring}
              >
                {aiScoring
                  ? "Analyzing…"
                  : typeof selected.aiScore === "number"
                  ? "Re-score"
                  : "Score with AI"}
              </button>
            </div>

            {typeof selected.aiScore === "number" ? (
              <div className={styles.aiPanel}>
                <div className={styles.aiScoreRow}>
                  <span
                    className={`${styles.aiScoreBig} ${styles["aiFit_" + (selected.aiFit || "")]}`}
                  >
                    {selected.aiScore}
                  </span>
                  <div>
                    <div className={styles.aiFitLabel}>{selected.aiFit || "—"} fit</div>
                    {selected.aiInsights?.summary && (
                      <div className={styles.aiSummary}>{selected.aiInsights.summary}</div>
                    )}
                  </div>
                </div>
                {selected.aiInsights?.strengths?.length > 0 && (
                  <div className={styles.aiBlock}>
                    <span className={styles.aiBlockTitle}>Strengths</span>
                    <ul>
                      {selected.aiInsights.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selected.aiInsights?.concerns?.length > 0 && (
                  <div className={styles.aiBlock}>
                    <span className={styles.aiBlockTitle}>Concerns</span>
                    <ul>
                      {selected.aiInsights.concerns.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selected.aiInsights?.recommendedAction && (
                  <div className={styles.aiAction}>
                    <strong>Next step:</strong> {selected.aiInsights.recommendedAction}
                  </div>
                )}
              </div>
            ) : (
              <p className={styles.muted}>
                Not scored yet. Run AI to assess this lead's fit.
              </p>
            )}

            <div className={styles.aiEmailRow}>
              <button
                className={styles.aiSmallBtn}
                onClick={handleAiEmail}
                disabled={emailBusy}
              >
                {emailBusy ? "Drafting…" : "✍ Draft outreach email (AI)"}
              </button>
            </div>
            {emailDraft && (
              <div className={styles.aiEmailDraft}>
                <div className={styles.aiEmailSubject}>
                  <strong>Subject:</strong> {emailDraft.subject}
                </div>
                <textarea
                  className={styles.aiEmailBody}
                  readOnly
                  value={emailDraft.body}
                  rows={6}
                />
                <div className={styles.aiEmailFoot}>
                  <button className={styles.aiSmallBtn} onClick={handleCopyEmail}>
                    {emailCopied ? "✓ Copied" : "📋 Copy"}
                  </button>
                  <span className={styles.muted}>Paste into your email client to send.</span>
                </div>
              </div>
            )}

            {/* Tasks */}
            <h4>Tasks</h4>
            <div className={styles.taskDrawerList}>
              {(selected.tasks || []).map((t) => {
                const tOverdue =
                  !t.done && t.dueDate && new Date(t.dueDate).getTime() < Date.now();
                return (
                  <div
                    key={t._id}
                    className={`${styles.drawerTask} ${tOverdue ? styles.drawerTaskOverdue : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => handleToggleTask(t)}
                    />
                    <span className={styles.drawerTaskBody}>
                      <span className={t.done ? styles.taskDoneText : ""}>{t.title}</span>
                      <span className={styles.drawerTaskMeta}>
                        <span className={`${styles.tprio} ${styles["tp_" + t.priority]}`}>
                          {t.priority}
                        </span>
                        {t.dueDate && (
                          <span className={tOverdue ? styles.danger : ""}>
                            due {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {t.assignedTo && <span>👤 {t.assignedTo}</span>}
                      </span>
                    </span>
                    <button
                      className={styles.taskDelBtn}
                      onClick={() => handleDeleteTask(t)}
                      title="Delete task"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              {(!selected.tasks || selected.tasks.length === 0) && (
                <p className={styles.muted}>No tasks yet.</p>
              )}
            </div>

            <form className={styles.taskForm} onSubmit={handleAddTask}>
              <input
                type="text"
                placeholder="New task..."
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              />
              <div className={styles.taskFormRow}>
                <input
                  type="text"
                  placeholder="Owner"
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                />
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
                <button type="submit">Add</button>
              </div>
            </form>

            {/* Offers */}
            <div className={styles.sectionHead}>
              <h4>Offer</h4>
              <button
                className={styles.scheduleToggle}
                onClick={() => setShowOfferForm((s) => !s)}
              >
                {showOfferForm ? "Cancel" : "+ Create offer"}
              </button>
            </div>

            {showOfferForm && (
              <form className={styles.ivForm} onSubmit={handleCreateOffer}>
                <div className={styles.ivRow}>
                  <label>
                    Salary
                    <input
                      type="number"
                      min="0"
                      value={offerForm.salary}
                      onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Currency
                    <select
                      value={offerForm.currency}
                      onChange={(e) => setOfferForm({ ...offerForm, currency: e.target.value })}
                    >
                      <option>USD</option>
                      <option>INR</option>
                      <option>EUR</option>
                      <option>GBP</option>
                    </select>
                  </label>
                </div>
                <div className={styles.ivRow}>
                  <label>
                    Joining date
                    <input
                      type="date"
                      value={offerForm.joiningDate}
                      onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                    />
                  </label>
                  <label>
                    Respond by
                    <input
                      type="date"
                      value={offerForm.expiryDate}
                      onChange={(e) => setOfferForm({ ...offerForm, expiryDate: e.target.value })}
                    />
                  </label>
                </div>
                <label>
                  Notes
                  <input
                    type="text"
                    value={offerForm.notes}
                    onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
                    placeholder="Optional"
                  />
                </label>
                <label className={styles.offerSendToggle}>
                  <input
                    type="checkbox"
                    checked={offerForm.send}
                    onChange={(e) => setOfferForm({ ...offerForm, send: e.target.checked })}
                  />
                  Email the offer to the candidate now
                </label>
                <button type="submit" className={styles.ivSubmit}>
                  {offerForm.send ? "Create & send offer" : "Save draft"}
                </button>
              </form>
            )}

            <div className={styles.ivList}>
              {(offersByApp[selected._id] || []).map((o) => (
                <div key={o._id} className={styles.ivItem}>
                  <div className={styles.ivMain}>
                    <div>
                      <strong>
                        {o.currency} {Number(o.salary).toLocaleString()}
                      </strong>
                      <div className={styles.ivWhen}>
                        {o.joiningDate
                          ? `Joins ${new Date(o.joiningDate).toLocaleDateString()}`
                          : "No joining date"}
                        {o.expiryDate
                          ? ` · expires ${new Date(o.expiryDate).toLocaleDateString()}`
                          : ""}
                      </div>
                    </div>
                    <div className={styles.ivRight}>
                      <span className={`${styles.offerStatus} ${styles["of_" + o.status]}`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                  <div className={styles.offerActions}>
                    {o.status === "Draft" && (
                      <button className={styles.ivSaveBtn} onClick={() => handleSendOffer(o._id)}>
                        Send
                      </button>
                    )}
                    {o.status === "Sent" && (
                      <>
                        <button
                          className={styles.ivSaveBtn}
                          onClick={() => handleRespondOffer(o._id, "Accepted")}
                        >
                          Mark accepted
                        </button>
                        <button
                          className={styles.ivCancel}
                          onClick={() => handleRespondOffer(o._id, "Declined")}
                        >
                          Declined
                        </button>
                      </>
                    )}
                    {o.status === "Accepted" && o.onboardingId && (
                      <span className={styles.onboardHint}>✓ Onboarding created</span>
                    )}
                    <button
                      className={styles.taskDelBtn}
                      onClick={() => handleDeleteOffer(o._id)}
                      title="Delete offer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {(offersByApp[selected._id] || []).length === 0 && !showOfferForm && (
                <p className={styles.muted}>No offer yet.</p>
              )}
            </div>

            {/* Interviews */}
            <div className={styles.sectionHead}>
              <h4>Interviews</h4>
              <button
                className={styles.scheduleToggle}
                onClick={() => setShowSchedule((s) => !s)}
              >
                {showSchedule ? "Cancel" : "+ Schedule"}
              </button>
            </div>

            {showSchedule && (
              <form className={styles.ivForm} onSubmit={handleScheduleInterview}>
                <label>
                  Date &amp; time
                  <input
                    type="datetime-local"
                    value={ivForm.scheduledAt}
                    onChange={(e) =>
                      setIvForm({ ...ivForm, scheduledAt: e.target.value })
                    }
                    required
                  />
                </label>
                <div className={styles.ivRow}>
                  <label>
                    Round
                    <input
                      type="text"
                      value={ivForm.round}
                      onChange={(e) => setIvForm({ ...ivForm, round: e.target.value })}
                      placeholder="e.g. Technical Round 1"
                    />
                  </label>
                  <label>
                    Mode
                    <select
                      value={ivForm.mode}
                      onChange={(e) => setIvForm({ ...ivForm, mode: e.target.value })}
                    >
                      <option value="Video">Video</option>
                      <option value="Phone">Phone</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </label>
                </div>
                <div className={styles.ivRow}>
                  <label>
                    Interviewer
                    <input
                      type="text"
                      value={ivForm.interviewer}
                      onChange={(e) =>
                        setIvForm({ ...ivForm, interviewer: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Duration (mins)
                    <input
                      type="number"
                      min="5"
                      value={ivForm.durationMins}
                      onChange={(e) =>
                        setIvForm({ ...ivForm, durationMins: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label>
                  Location / link
                  <input
                    type="text"
                    value={ivForm.location}
                    onChange={(e) => setIvForm({ ...ivForm, location: e.target.value })}
                    placeholder="Meeting link or address"
                  />
                </label>
                <button type="submit" className={styles.ivSubmit}>
                  Schedule &amp; email candidate
                </button>
              </form>
            )}

            <div className={styles.ivList}>
              {(byApplication[selected._id] || []).map((iv) => (
                <div key={iv._id} className={styles.ivItem}>
                  <div className={styles.ivMain}>
                    <div>
                      <strong>{iv.round}</strong> · {iv.mode}
                      <div className={styles.ivWhen}>
                        {new Date(iv.scheduledAt).toLocaleString()}
                        {iv.interviewer ? ` · ${iv.interviewer}` : ""}
                      </div>
                    </div>
                    <div className={styles.ivRight}>
                      <span className={`${styles.ivStatus} ${styles["iv_" + iv.status.replace("-", "")]}`}>
                        {iv.status}
                      </span>
                      {iv.status !== "Cancelled" && (
                        <button
                          className={styles.ivCancel}
                          onClick={() => openFeedback(iv)}
                        >
                          {iv.feedback || iv.rating ? "Edit review" : "Review"}
                        </button>
                      )}
                      {iv.status === "Scheduled" && (
                        <button
                          className={styles.ivCancel}
                          onClick={() => handleCancelInterview(iv._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Recorded feedback (read-only) */}
                  {(iv.feedback || iv.rating > 0) && feedbackFor !== iv._id && (
                    <div className={styles.ivFeedback}>
                      {iv.rating > 0 && (
                        <span className={styles.ivStars}>
                          {"★".repeat(iv.rating)}
                          {"☆".repeat(5 - iv.rating)}
                        </span>
                      )}
                      {iv.feedback && <span>{iv.feedback}</span>}
                    </div>
                  )}

                  {/* Inline review editor */}
                  {feedbackFor === iv._id && (
                    <div className={styles.ivReview}>
                      <div className={styles.ivRow}>
                        <label>
                          Outcome
                          <select
                            value={fbForm.status}
                            onChange={(e) =>
                              setFbForm({ ...fbForm, status: e.target.value })
                            }
                          >
                            <option value="Completed">Completed</option>
                            <option value="No-show">No-show</option>
                            <option value="Scheduled">Keep Scheduled</option>
                          </select>
                        </label>
                        <label>
                          Rating
                          <div className={styles.starPick}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <span
                                key={n}
                                className={n <= fbForm.rating ? styles.starOn : styles.starOff}
                                onClick={() => setFbForm({ ...fbForm, rating: n })}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </label>
                      </div>
                      <textarea
                        className={styles.ivFeedbackInput}
                        placeholder="Interview feedback / notes..."
                        value={fbForm.feedback}
                        onChange={(e) =>
                          setFbForm({ ...fbForm, feedback: e.target.value })
                        }
                      />
                      <div className={styles.ivReviewActions}>
                        <button
                          className={styles.ivCancel}
                          onClick={() => setFeedbackFor(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className={styles.ivSaveBtn}
                          onClick={() => handleSaveFeedback(iv._id)}
                        >
                          Save review
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {(byApplication[selected._id] || []).length === 0 && !showSchedule && (
                <p className={styles.muted}>No interviews scheduled.</p>
              )}
            </div>

            <div className={styles.addNote}>
              <input
                type="text"
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <button onClick={handleAddNote}>Add</button>
            </div>

            <h4>Activity Timeline</h4>
            <div className={styles.timeline}>
              {(selected.activities || [])
                .slice()
                .reverse()
                .map((a, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <span className={`${styles.dot} ${styles["dot_" + a.type]}`} />
                    <div>
                      <div className={styles.timelineMsg}>{a.message}</div>
                      <div className={styles.timelineMeta}>
                        {a.by || "system"} · {new Date(a.at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              {(!selected.activities || selected.activities.length === 0) && (
                <p className={styles.muted}>No activity yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pipeline;
