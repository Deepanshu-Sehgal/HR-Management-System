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
  runSlaSweep,
} from "../../redux/Slices/PipelineSlice";
import { fetchJobApplications } from "../../redux/Slices/JobApplicationSlice";
import {
  fetchUpcomingInterviews,
  fetchInterviewsByApplication,
  scheduleInterview,
  cancelInterview,
  updateInterview,
} from "../../redux/Slices/InterviewSlice";
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

  const [selected, setSelected] = useState(null); // application in detail drawer
  const [note, setNote] = useState("");
  const [sweeping, setSweeping] = useState(false);
  const [search, setSearch] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [ivForm, setIvForm] = useState(EMPTY_INTERVIEW);
  const [feedbackFor, setFeedbackFor] = useState(null); // interview id being reviewed
  const [fbForm, setFbForm] = useState({ status: "Completed", rating: 0, feedback: "" });

  const pipelineId = activePipeline?._id;

  // Bootstrap: ensure a default pipeline, then load its board + job applications.
  useEffect(() => {
    dispatch(ensureDefaultPipeline());
    dispatch(fetchJobApplications());
    dispatch(fetchUpcomingInterviews());
  }, [dispatch]);

  // When a candidate drawer opens, load that candidate's interviews.
  useEffect(() => {
    if (selected?._id) {
      dispatch(fetchInterviewsByApplication(selected._id));
      setShowSchedule(false);
      setIvForm(EMPTY_INTERVIEW);
    }
  }, [dispatch, selected?._id]);

  useEffect(() => {
    if (pipelineId) {
      dispatch(fetchBoard(pipelineId));
      dispatch(fetchFunnel(pipelineId));
      dispatch(fetchOverdue(pipelineId));
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

  const handleSweep = async () => {
    setSweeping(true);
    await dispatch(runSlaSweep());
    refresh();
    setSweeping(false);
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
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (a.applicantName || "").toLowerCase().includes(q) ||
          (a.jobTitle || "").toLowerCase().includes(q)
        );
      }
      return true;
    });

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
          <button className={styles.sweepBtn} onClick={handleSweep} disabled={sweeping}>
            {sweeping ? "Running..." : "⚙ Run Automation Now"}
          </button>
        </div>
      </div>

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
        {(search || overdueOnly) && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              setSearch("");
              setOverdueOnly(false);
            }}
          >
            Clear
          </button>
        )}
        <span className={styles.hint}>Tip: drag a card to another column to move it.</span>
      </div>

      {/* Kanban board */}
      {loading ? (
        <p>Loading board...</p>
      ) : (
        <div className={styles.board}>
          {columns.map((col) => {
            const visible = filterApps(col.applications);
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
                      {app.rating > 0 && (
                        <span className={styles.rating}>★ {app.rating}</span>
                      )}
                    </div>
                    <div className={styles.cardJob}>{app.jobTitle}</div>
                    <div className={styles.cardMeta}>
                      {app.assignedTo && <span>👤 {app.assignedTo}</span>}
                      {app.stageEnteredAt && (
                        <span>⏱ {daysInStage(app.stageEnteredAt)}d in stage</span>
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
