//by Paras

import React, { useEffect, useState } from "react";
import ReusableTable from "../Reusables/ReusableTable";
import { Delete, Search, Profile, Vertical } from "../../assets"; // Import the SearchIcon
import styles from "./Candidates.module.css"; // Import your CSS module for styling
import { useDispatch, useSelector } from "react-redux";
import { changeWorkingEmp } from "../../redux/Slices/EmployeeSlice";
import {
  useGetUsersMutation,
  useUpdateUserMutation,
} from "../../redux/Services/EmployeeApi";

const Attendance = () => {
  const [selectedPosition, setSelectedPosition] = useState(""); // State for filter dropdown
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [employeeData, setEmployeeData] = useState([]);
  const positionOptions = ["Designer", "Developer", "Human Resources"];
  const [newtask, setNewtask] = useState("");
  const [getUsers, { isError, isLoading }] = useGetUsersMutation();
  const [updateUser, { issError, issLoading }] = useUpdateUserMutation();
  const columns = [
    { header: "", accessor: "SquareDiv" },
    { header: "Profile", accessor: "profile" },
    { header: "Employee Name", accessor: "employeeName" },
    { header: "Designation", accessor: "position" },
    { header: "Department", accessor: "department" },
    { header: "Task", accessor: "task" },
    { header: "Status", accessor: "status" },
    { header: "", accessor: "edit" },
  ];
  const fetchCandidates = async () => {
    try {
      const body = {
        department: selectedPosition,
      };
      console.log(" fetch data");
      const response = await getUsers(body);
      console.log(response.data, " fetch data");
      setEmployeeData(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  useEffect(() => {
    fetchCandidates();
    console.log(employeeData, "emp data");
  }, [selectedPosition]);
  // const tableData = [
  //   {
  //     SquareDiv: <div className={styles.sq} />,
  //     profile: <img src={Profile} alt="Profile" />,
  //     CandidateName: "John Doe",
  //     designation: "john.doe@example.com",
  //     department: "Software Engineer",
  //     task: "asdasdasdadada",
  //     status: "Absent",
  //     edit: <img src={Vertical} alt="Delete" style={{ cursor: "pointer" }} />,
  //   },
  // ];

  const updatedTableData = employeeData.map((employee, index) => ({
    ...employee,
    profile: (
      <img
        src={`http://localhost:5000/uploads/${employee.image}`}
        alt="Profile"
        style={{ height: "30px", width: "30px", borderRadius: "20px" }}
        className={styles.profileImg}
      />
    ),
    SquareDiv: (
      <div
        className={styles.squareDiv}
        style={
          employee.status === "Absent"
            ? {
                backgroundImage:
                  "linear-gradient(180deg, #FF3D3D 0%, #992525 100%)",
              }
            : employee.status === "Present"
            ? {
                backgroundImage:
                  "linear-gradient(180deg, #1C982E 0%, #0E4F17 100%)",
              }
            : employee.status === "Work from Home"
            ? {
                backgroundImage:
                  "linear-gradient(180deg, #62C9CD 0%, #298487 100%)",
              }
            : employee.status === "Medical Leave"
            ? {
                backgroundImage:
                  "linear-gradient(180deg, #DAC400 0%, #D0BB00 100%)",
              }
            : { backgroundColor: "white" }
        }
      />
    ),
    edit: <img src={Vertical} alt="Delete" style={{ cursor: "pointer" }} />,
    // Assign Sno based on the index
  }));

  const handlePositionChange = (e) => setSelectedPosition(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const statusVal = useSelector((state) => state.employeeId.status);
  const id = useSelector((state) => state.employeeId.id);
  const working = useSelector((state) => state.employeeId.working);
  const dispatch = useDispatch();

  const handleUpdateCandidate = async (body) => {
    console.log(id, "idd vlaue");

    try {
      const response = await updateUser({ id, body });

      fetchCandidates();
    } catch (error) {
      console.log("NHK");
      console.error("Error:", error);
    }
  };
  if (working) {
    const bodyvalue = {
      status: statusVal,
    };
    handleUpdateCandidate(bodyvalue);
    dispatch(changeWorkingEmp(false));
  }

  useEffect(() => {
    const bodyvalue = {
      task: newtask,
    };
    handleUpdateCandidate(bodyvalue);
  }, [newtask]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        {/* Navigation Section */}
        <div className={styles.navbar}>
          {/* Left side - Dropdowns */}
          <div className={styles.navLeft}>
            <select value={selectedPosition} onChange={handlePositionChange}>
              <option value="">All</option>
              {positionOptions.map((position, index) => (
                <option key={index} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          {/* Right side - Search bar and Add button */}
          <div className={styles.navRight}>
            <div className={styles.searchWrapper}>
              <img src={Search} alt="Search" className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search "
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Reusable Table */}
        <ReusableTable
          navItems={[]}
          tableData={updatedTableData}
          columns={columns}
          name="Attendance"
          newtask={setNewtask}
        />
      </div>
    </div>
  );
};

export default Attendance;
