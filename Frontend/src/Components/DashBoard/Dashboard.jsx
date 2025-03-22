import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import dash from "./Dashboard.module.css";
import LogoutPopup from "../Auth/LogoutPopup"; // Ensure you have this component
import {
  Logo,
  UserAdd,
  UserGroup,
  Signal,
  Shine,
  Logout,
  ChevronDown,
  Mail,
  Notifications,
  Profile,
  Leftmenu,
} from "../../assets";

const Dashboard = () => {
  const [isLogoutPopupOpen, setLogoutPopupOpen] = useState(false);
  const location = useLocation();

  const pageTitles = {
    "/dashboard/candidates": "Candidates",
    "/dashboard/employees": "Employees",
    "/dashboard/attendance": "Attendance",
    "/dashboard/leaves": "Leaves",
  };

  const currentPage = pageTitles[location.pathname] || "Candidates";

  useEffect(() => {
    // Prevent body scrolling
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const handleLogoutClick = () => {
    setLogoutPopupOpen(true);
  };

  const handleCloseLogoutPopup = () => {
    setLogoutPopupOpen(false);
  };

  const handleConfirmLogout = () => {
    window.location.href = "/login";
  };

  return (
    <div className={dash.dashboardLayout}>
      {/* Sidebar */}
      <div className={dash.sidebar}>
        <div className={dash.logo1}>
          <img src={Logo} alt="Logo" />
        </div>

        <div className={dash.menuSection}>
          <div className={dash.menuHeading}>Recruitment</div>
          <Link
            to="/dashboard/candidates"
            className={`${dash.menuItem} ${
              location.pathname === "/dashboard/candidates" ? dash.active : ""
            }`}
          >
            {location.pathname === "/dashboard/candidates" && (
              <img src={Leftmenu} alt="Selected" className={dash.leftBar} />
            )}
            <img
              src={UserAdd}
              alt="Candidates"
              className={`${dash.icon} ${
                location.pathname === "/dashboard/candidates"
                  ? dash.activeIcon
                  : ""
              }`}
            />
            Candidates
          </Link>
        </div>

        <div className={dash.menuSection}>
          <div className={dash.menuHeading}>Organisation</div>
          <Link
            to="/dashboard/employees"
            className={`${dash.menuItem} ${
              location.pathname === "/dashboard/employees" ? dash.active : ""
            }`}
          >
            {location.pathname === "/dashboard/employees" && (
              <img src={Leftmenu} alt="Selected" className={dash.leftBar} />
            )}
            <img
              src={UserGroup}
              alt="Employees"
              className={`${dash.icon} ${
                location.pathname === "/dashboard/employees"
                  ? dash.activeIcon
                  : ""
              }`}
            />
            Employees
          </Link>
          <Link
            to="/dashboard/attendance"
            className={`${dash.menuItem} ${
              location.pathname === "/dashboard/attendance" ? dash.active : ""
            }`}
          >
            {location.pathname === "/dashboard/attendance" && (
              <img src={Leftmenu} alt="Selected" className={dash.leftBar} />
            )}
            <img src={Signal} alt="Attendance" className={dash.icon} />
            Attendance
          </Link>
          <Link
            to="/dashboard/leaves"
            className={`${dash.menuItem} ${
              location.pathname === "/dashboard/leaves" ? dash.active : ""
            }`}
          >
            {location.pathname === "/dashboard/leaves" && (
              <img src={Leftmenu} alt="Selected" className={dash.leftBar} />
            )}
            <img src={Shine} alt="Leaves" className={dash.icon} />
            Leaves
          </Link>
        </div>

        <div className={dash.menuSection}>
          <div className={dash.menuHeading}>Others</div>
          <button
            onClick={handleLogoutClick}
            className={`${dash.menuItem} ${dash.logout}`}
          >
            <img src={Logout} alt="Logout" className={dash.icon} />
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={dash.main}>
        {/* Header */}
        <div className={dash.headerContainer}>
          <h3>{currentPage}</h3>
          <div className={dash.headerIcons}>
            <img src={Mail} alt="Mail" className={dash.icon} />
            <img
              src={Notifications}
              alt="Notifications"
              className={dash.icon}
            />
            <div className={dash.profile}>
              <img src={Profile} alt="Profile" className={dash.profileIcon} />
              <img src={ChevronDown} alt="Dropdown" className={dash.icon} />
              <div className={dash.dropdown}>
                <a href="" className={dash.logoutLink}>
                  Change password
                </a>
                <a href="" className={dash.logoutLink}>
                  Edit Profile
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Content from Outlet */}
        <div className={dash.content}>
          <Outlet />
        </div>
      </div>

      {/* Logout Popup */}
      <LogoutPopup
        isOpen={isLogoutPopupOpen}
        onClose={handleCloseLogoutPopup}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

export default Dashboard;
