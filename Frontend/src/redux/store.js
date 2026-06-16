import { configureStore } from "@reduxjs/toolkit";
import employeIdRed from "./Slices/EmployeeSlice";
import candidate from "./Slices/CandidateSlice";
import leaveid from "./Slices/LeaveSlice";
import department from "./Slices/DepartmentSlice";
import performance from "./Slices/PerformanceSlice";
import payroll from "./Slices/PayrollSlice";
import skill from "./Slices/SkillSlice";
import jobOpening from "./Slices/JobOpeningSlice";
import jobApplication from "./Slices/JobApplicationSlice";
import announcement from "./Slices/AnnouncementSlice";
import document from "./Slices/DocumentSlice";
import attendanceAnalytics from "./Slices/AttendanceAnalyticsSlice";
import report from "./Slices/ReportSlice";
import { CandidateApi } from "./Services/CandidateApi";
import { setupListeners } from "@reduxjs/toolkit/query";
import { EmployeeApi } from "./Services/EmployeeApi";
import { LeaveApi } from "./Services/LeaveApi";

export const store = configureStore({
  reducer: {
    candidate: candidate,
    employeeId: employeIdRed,
    leave: leaveid,
    department: department,
    performance: performance,
    payroll: payroll,
    skill: skill,
    jobOpening: jobOpening,
    jobApplication: jobApplication,
    announcement: announcement,
    document: document,
    attendanceAnalytics: attendanceAnalytics,
    report: report,
    [CandidateApi.reducerPath]: CandidateApi.reducer,
    [EmployeeApi.reducerPath]: EmployeeApi.reducer,
    [LeaveApi.reducerPath]: LeaveApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(CandidateApi.middleware)
      .concat(EmployeeApi.middleware)
      .concat(LeaveApi.middleware),
});

setupListeners(store.dispatch);
