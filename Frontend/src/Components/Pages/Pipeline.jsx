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
import styles from "./Pipeline.module.css";

const isOverdue = (dueAt) => dueAt && new Date(dueAt).getTime() < Date.now();

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

  const [selected, setSelected] = useState(null); // application in detail drawer
  const [note, setNote] = useState("");
  const [sweeping, setSweeping] = useState(false);

  const pipelineId = activePipeline?._id;

  // Bootstrap: ensure a default pipeline, then load its board + job applications.
  useEffect(() => {
    dispatch(ensureDefaultPipeline());
    dispatch(fetchJobApplications());
  }, [dispatch]);

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

      {/* Kanban board */}
      {loading ? (
        <p>Loading board...</p>
      ) : (
        <div className={styles.board}>
          {columns.map((col) => (
            <div key={col.key} className={styles.column}>
              <div className={styles.columnHeader} style={{ borderTopColor: col.color }}>
                <span className={styles.columnName}>{col.name}</span>
                <span className={styles.columnCount}>{col.count}</span>
                {col.overdueCount > 0 && (
                  <span className={styles.overduePill}>{col.overdueCount} late</span>
                )}
              </div>

              <div className={styles.columnBody}>
                {col.applications.length === 0 && (
                  <div className={styles.emptyCol}>No candidates</div>
                )}
                {col.applications.map((app) => (
                  <div
                    key={app._id}
                    className={`${styles.card} ${isOverdue(app.dueAt) ? styles.cardOverdue : ""}`}
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
          ))}
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
