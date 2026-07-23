import React, { useEffect, useState } from "react";
import apiClient from "../../utils/apiClient";
import styles from "./HRManagement.module.css";
import { UserGroup, Work, TrendUp, CheckCircle, Alarm } from "../../assets";

const actions = [
  "Review onboarding checklist for 3 new hires",
  "Approve 2 leave requests before Friday",
  "Schedule quarterly feedback conversations",
];

const HRManagement = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/reports/overview");
      setOverview(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load HR overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const metrics = [
    {
      title: "Active employees",
      value: overview?.totalEmployees ?? "—",
      caption: "Across all departments",
      icon: UserGroup,
      accent: "blue",
    },
    {
      title: "Open roles",
      value: overview?.activeJobOpenings ?? "—",
      caption: "Hiring demand live now",
      icon: Work,
      accent: "purple",
    },
    {
      title: "Attendance rate",
      value: overview?.attendance?.averageAttendance
        ? `${overview.attendance.averageAttendance.toFixed(1)}%`
        : "—",
      caption: "Average employee attendance",
      icon: TrendUp,
      accent: "green",
    },
    {
      title: "Avg performance",
      value: overview?.performance?.averageRating
        ? overview.performance.averageRating.toFixed(1)
        : "—",
      caption: "Review score across teams",
      icon: CheckCircle,
      accent: "orange",
    },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HR management</p>
          <h2>People operations at a glance</h2>
          <p>
            Track hiring health, attendance, and employee engagement from one
            place.
          </p>
        </div>
        <button className={styles.primaryButton} onClick={loadOverview}>
          {loading ? "Refreshing..." : "Refresh HR Analytics"}
        </button>
      </section>

      <section className={styles.grid}>
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className={`${styles.metricCard} ${styles[item.accent]}`}>
              <div className={styles.iconWrap}>
                <img src={Icon} alt={item.title} className={styles.icon} />
              </div>
              <p className={styles.metricValue}>{item.value}</p>
              <h3>{item.title}</h3>
              <p className={styles.caption}>{item.caption}</p>
            </article>
          );
        })}
      </section>

      <section className={styles.panelGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Upcoming HR actions</h3>
            <span className={styles.pill}>This week</span>
          </div>
          <ul className={styles.list}>
            {actions.map((action) => (
              <li key={action} className={styles.listItem}>
                <img src={Alarm} alt="Alert" className={styles.listIcon} />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Team health snapshot</h3>
            <span className={styles.pill}>Live summary</span>
          </div>
          <div className={styles.metricRow}>
            <div>
              <span>Attendance rate</span>
              <strong>
                {overview?.attendance?.averageAttendance
                  ? `${overview.attendance.averageAttendance.toFixed(1)}%`
                  : "—"}
              </strong>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: overview?.attendance?.averageAttendance
                    ? `${Math.min(100, overview.attendance.averageAttendance)}%`
                    : "0%",
                }}
              />
            </div>
          </div>
          <div className={styles.metricRow}>
            <div>
              <span>Performance score</span>
              <strong>
                {overview?.performance?.averageRating
                  ? overview.performance.averageRating.toFixed(1)
                  : "—"}
              </strong>
            </div>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${styles.engagement}`}
                style={{
                  width: overview?.performance?.averageRating
                    ? `${Math.min(100, (overview.performance.averageRating / 5) * 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Top skill gaps</h3>
            <span className={styles.pill}>Talent demand</span>
          </div>
          {loading ? (
            <p>Loading skill gap data...</p>
          ) : overview?.skillGap?.length ? (
            <ul className={styles.gapList}>
              {overview.skillGap.slice(0, 6).map((item) => (
                <li key={item.skill} className={styles.gapItem}>
                  <strong>{item.skill}</strong>
                  <span>
                    Demand {item.demand} / Supply {item.supply} / Gap {item.gap}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No skill gap data available yet.</p>
          )}
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
      </section>
    </div>
  );
};

export default HRManagement;
