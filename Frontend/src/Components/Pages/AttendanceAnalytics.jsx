import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttendanceAnalytics, getAttendanceSummary } from "../../redux/Slices/AttendanceAnalyticsSlice";
import styles from "./AttendanceAnalytics.module.css";

function AttendanceAnalytics() {
  const dispatch = useDispatch();
  const { analytics, summary, loading } = useSelector((state) => state.attendanceAnalytics);

  useEffect(() => {
    dispatch(fetchAttendanceAnalytics());
    dispatch(getAttendanceSummary());
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <h1>Attendance Analytics</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className={styles.summaryCards}>
            <div className={styles.card}>
              <h3>Average Attendance</h3>
              <p className={styles.value}>{summary.avgAttendance?.toFixed(2)}%</p>
            </div>
            <div className={styles.card}>
              <h3>Total Employees</h3>
              <p className={styles.value}>{summary.totalEmployees}</p>
            </div>
            <div className={styles.card}>
              <h3>High Absenteeism</h3>
              <p className={styles.value}>{summary.highAbsenteeism}</p>
            </div>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Month</th>
                <th>Present Days</th>
                <th>Absent Days</th>
                <th>Leave Days</th>
                <th>Late Days</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {analytics.map((record) => (
                <tr key={record._id}>
                  <td>{record.employeeName}</td>
                  <td>{record.month}</td>
                  <td>{record.presentDays}</td>
                  <td>{record.absentDays}</td>
                  <td>{record.leaveDays}</td>
                  <td>{record.lateDays}</td>
                  <td>
                    <span
                      className={
                        record.attendancePercentage >= 75
                          ? styles.good
                          : styles.poor
                      }
                    >
                      {record.attendancePercentage.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default AttendanceAnalytics;
