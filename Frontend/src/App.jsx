/*
 * File: Frontend/src/App.jsx
 * Purpose: Defines the client-side routes and application layout. This file
 * wires top-level routes for authentication (registration/login) and the
 * dashboard area (candidates, employees, attendance, leaves).
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registration from "./Components/Auth/Registration";
import Login from "./Components/Auth/Login";
import Layout from "./Components/Layout/Layout";
import DashBoard from "./Components/DashBoard/Dashboard";
import Candidates from "./Components/Pages/Candidates";
import Employees from "./Components/Pages/Employees";
import Attendance from "./Components/Pages/Attendance";
import Leaves from "./Components/Pages/Leaves";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Layout for Registration and Login */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Registration />} />
          <Route path="login" element={<Login />} />
        </Route>

        {/* Dashboard Layout with nested routes */}
        <Route path="/dashboard" element={<DashBoard />}>
          <Route path="candidates" element={<Candidates />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leaves />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
