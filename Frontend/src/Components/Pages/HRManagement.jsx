import React from "react";
import styles from "./HRManagement.module.css";
import { UserGroup, Work, TrendUp, CheckCircle, Alarm } from "../../assets";

const metrics = [
  {
    title: "Active employees",
    value: "248",
    caption: "Across 8 departments",
    icon: UserGroup,
    accent: "blue",
  },
  {
    title: "Open roles",
    value: "14",
    caption: "5 priority hiring needs",
    icon: Work,
    accent: "purple",
  },
  {
    title: "Attendance rate",
    value: "94%",
    caption: "Improved this month",
    icon: TrendUp,
    accent: "green",
  },
  {
    title: "Pending reviews",
    value: "6",
    caption: "Due in next 7 days",
    icon: CheckCircle,
    accent: "orange",
  },
];

const actions = [
  "Review onboarding checklist for 3 new hires",
  "Approve 2 leave requests before Friday",
  "Schedule quarterly feedback conversations",
];

const HRManagement = () => {
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
        <button className={styles.primaryButton}>Run HR Review</button>
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
          <div className={styles.progressSection}>
            <div className={styles.progressRow}>
              <span>Attendance rate</span>
              <strong>94%</strong>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} />
            </div>
          </div>
          <div className={styles.progressSection}>
            <div className={styles.progressRow}>
              <span>Engagement score</span>
              <strong>4.6/5</strong>
            </div>
            <div className={styles.progressBar}>
              <div className={`${styles.progressFill} ${styles.engagement}`} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HRManagement;
