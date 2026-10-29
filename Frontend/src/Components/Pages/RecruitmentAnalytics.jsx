import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRecruitmentOverview,
  fetchRecruiterWorkload,
} from "../../redux/Slices/RecruitmentAnalyticsSlice";
import styles from "./RecruitmentAnalytics.module.css";

const BAR_COLORS = ["#4f46e5", "#0ea5e9", "#8b5cf6", "#f59e0b", "#16a34a", "#dc2626"];

function BarList({ title, data, labelKey, valueKey }) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  return (
    <div className={styles.panel}>
      <h3>{title}</h3>
      {data.length === 0 ? (
        <p className={styles.muted}>No data yet.</p>
      ) : (
        <div className={styles.bars}>
          {data.map((d, i) => (
            <div key={d[labelKey] + i} className={styles.barRow}>
              <span className={styles.barLabel} title={d[labelKey]}>
                {d[labelKey]}
              </span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${(d[valueKey] / max) * 100}%`,
                    background: BAR_COLORS[i % BAR_COLORS.length],
                  }}
                />
              </div>
              <span className={styles.barValue}>{d[valueKey]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecruitmentAnalytics() {
  const dispatch = useDispatch();
  const { overview, workload, loading, error } = useSelector(
    (state) => state.recruitmentAnalytics
  );
  const [wlSort, setWlSort] = useState({ key: "leads", dir: "desc" });

  // Sort the workload table by the chosen column (text asc, numbers respect dir).
  const sortedWorkload = useMemo(() => {
    const { key, dir } = wlSort;
    const mult = dir === "asc" ? 1 : -1;
    return [...workload].sort((a, b) => {
      if (key === "owner") return mult * String(a.owner).localeCompare(String(b.owner));
      return mult * ((a[key] || 0) - (b[key] || 0));
    });
  }, [workload, wlSort]);

  const toggleWlSort = (key) =>
    setWlSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }
    );
  const sortArrow = (key) =>
    wlSort.key === key ? (wlSort.dir === "asc" ? " ▲" : " ▼") : "";

  useEffect(() => {
    dispatch(fetchRecruitmentOverview());
    dispatch(fetchRecruiterWorkload());
  }, [dispatch]);

  if (loading && !overview) return <div className={styles.container}><p>Loading analytics...</p></div>;
  if (error) return <div className={styles.container}><p className={styles.error}>{error}</p></div>;
  if (!overview) return <div className={styles.container}><p className={styles.muted}>No data.</p></div>;

  const { totals, byStage, topJobs, interviews, offers } = overview;

  const kpis = [
    { label: "Candidates", value: totals.candidates },
    { label: "Active", value: totals.active },
    { label: "Hires", value: totals.hires },
    { label: "Conversion", value: `${totals.conversionRate}%` },
    { label: "Avg Time-to-Hire", value: `${totals.avgTimeToHire}d` },
    { label: "Offer Accept Rate", value: `${offers.acceptanceRate}%` },
  ];

  const exportWorkloadCsv = () => {
    const cols = ["Recruiter", "Active Leads", "Overdue", "Open Tasks", "Avg AI Score"];
    const esc = (v) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = workload.map((w) => [
      w.owner,
      w.leads,
      w.overdue,
      w.openTasks,
      w.avgAiScore || "",
    ]);
    const csv = [cols, ...rows].map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `recruiter-workload-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1>Recruitment Analytics</h1>
          <p className={styles.subtitle}>
            A live snapshot across every pipeline — candidates, interviews, offers, and SLAs.
          </p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={() => {
            dispatch(fetchRecruitmentOverview());
            dispatch(fetchRecruiterWorkload());
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className={styles.kpiGrid}>
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpiCard}>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={styles.kpiLabel}>{k.label}</span>
          </div>
        ))}
      </div>

      {/* Alert strip */}
      <div className={styles.alertRow}>
        <div className={`${styles.alert} ${totals.overdueTasks ? styles.alertDanger : ""}`}>
          <strong>{totals.openTasks}</strong> open tasks
          {totals.overdueTasks > 0 && (
            <span className={styles.alertBadge}>{totals.overdueTasks} overdue</span>
          )}
        </div>
        <div className={`${styles.alert} ${totals.slaBreached ? styles.alertDanger : ""}`}>
          <strong>{totals.slaBreached}</strong> SLA-breached candidates
        </div>
        <div className={styles.alert}>
          <strong>{interviews.upcoming}</strong> upcoming interviews
        </div>
      </div>

      <div className={styles.panelGrid}>
        <BarList title="Candidates by stage" data={byStage} labelKey="name" valueKey="count" />
        <BarList title="Top openings by volume" data={topJobs} labelKey="jobTitle" valueKey="count" />

        {/* Interviews */}
        <div className={styles.panel}>
          <h3>Interviews</h3>
          <div className={styles.miniStats}>
            <div><span>{interviews.total}</span><small>Total</small></div>
            <div><span>{interviews.scheduled}</span><small>Scheduled</small></div>
            <div><span>{interviews.completed}</span><small>Completed</small></div>
            <div><span>{interviews.upcoming}</span><small>Upcoming</small></div>
          </div>
        </div>

        {/* Offers */}
        <div className={styles.panel}>
          <h3>Offers</h3>
          <div className={styles.miniStats}>
            <div><span>{offers.total}</span><small>Total</small></div>
            <div><span>{offers.Sent}</span><small>Sent</small></div>
            <div className={styles.good}><span>{offers.Accepted}</span><small>Accepted</small></div>
            <div className={styles.bad}><span>{offers.Declined}</span><small>Declined</small></div>
            <div className={styles.warn}><span>{offers.Expired}</span><small>Expired</small></div>
          </div>
          <div className={styles.acceptBar}>
            <div className={styles.acceptFill} style={{ width: `${offers.acceptanceRate}%` }} />
            <span className={styles.acceptLabel}>{offers.acceptanceRate}% acceptance</span>
          </div>
        </div>
      </div>

      {/* Recruiter workload */}
      <div className={styles.panel} style={{ marginTop: 16 }}>
        <div className={styles.panelHead}>
          <h3>Recruiter workload (active leads)</h3>
          {workload.length > 0 && (
            <button className={styles.exportBtn} onClick={exportWorkloadCsv}>
              ⬇ Export CSV
            </button>
          )}
        </div>
        {workload.length === 0 ? (
          <p className={styles.muted}>No active leads assigned yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.wlTable}>
              <thead>
                <tr>
                  <th className={styles.sortable} onClick={() => toggleWlSort("owner")}>
                    Recruiter{sortArrow("owner")}
                  </th>
                  <th className={styles.sortable} onClick={() => toggleWlSort("leads")}>
                    Active leads{sortArrow("leads")}
                  </th>
                  <th className={styles.sortable} onClick={() => toggleWlSort("overdue")}>
                    Overdue{sortArrow("overdue")}
                  </th>
                  <th className={styles.sortable} onClick={() => toggleWlSort("openTasks")}>
                    Open tasks{sortArrow("openTasks")}
                  </th>
                  <th className={styles.sortable} onClick={() => toggleWlSort("avgAiScore")}>
                    Avg AI{sortArrow("avgAiScore")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedWorkload.map((w) => (
                  <tr key={w.owner}>
                    <td>{w.owner}</td>
                    <td>{w.leads}</td>
                    <td className={w.overdue ? styles.bad : ""}>{w.overdue}</td>
                    <td>{w.openTasks}</td>
                    <td>{w.avgAiScore || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruitmentAnalytics;
