import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecruitmentOverview } from "../../redux/Slices/RecruitmentAnalyticsSlice";
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
  const { overview, loading, error } = useSelector((state) => state.recruitmentAnalytics);

  useEffect(() => {
    dispatch(fetchRecruitmentOverview());
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

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1>Recruitment Analytics</h1>
          <p className={styles.subtitle}>
            A live snapshot across every pipeline — candidates, interviews, offers, and SLAs.
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={() => dispatch(fetchRecruitmentOverview())}>
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
    </div>
  );
}

export default RecruitmentAnalytics;
