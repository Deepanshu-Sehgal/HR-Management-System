import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registration from "./Components/Auth/Registration";
import Login from "./Components/Auth/Login";
import Layout from "./Components/Layout/Layout";
import DashBoard from "./Components/DashBoard/Dashboard";
import PrivateRoute from "./Components/Auth/PrivateRoute";
import Candidates from "./Components/Pages/Candidates";
import Employees from "./Components/Pages/Employees";
import Attendance from "./Components/Pages/Attendance";
import Leaves from "./Components/Pages/Leaves";
import Departments from "./Components/Pages/Departments";
import PerformanceReviews from "./Components/Pages/PerformanceReviews";
import Payroll from "./Components/Pages/Payroll";
import Recruitment from "./Components/Pages/Recruitment";
import Announcements from "./Components/Pages/Announcements";
import Documents from "./Components/Pages/Documents";
import AttendanceAnalytics from "./Components/Pages/AttendanceAnalytics";
import Reports from "./Components/Pages/Reports";
import Subscription from "./Components/Pages/Subscription";
import AiAssistant from "./Components/Pages/AiAssistant";
import HRManagement from "./Components/Pages/HRManagement";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Registration />} />
          <Route path="login" element={<Login />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashBoard />
            </PrivateRoute>
          }
        >
          <Route path="candidates" element={<Candidates />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="departments" element={<Departments />} />
          <Route path="performance" element={<PerformanceReviews />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="documents" element={<Documents />} />
          <Route path="attendance-analytics" element={<AttendanceAnalytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="ai-assistant" element={<AiAssistant />} />
          <Route path="hr-management" element={<HRManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
