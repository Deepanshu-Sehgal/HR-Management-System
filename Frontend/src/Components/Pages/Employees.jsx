// src/Components/Candidates.js
import React, { useEffect, useState } from "react";
import ReusableTable from "../Reusables/ReusableTable";
import { Delete, Search, Profile, Vertical } from "../../assets"; // Import the SearchIcon
import styles from "./Candidates.module.css"; // Import your CSS module for styling
import PopupForm from "../Reusables/PopupForm";
import { useDispatch, useSelector } from "react-redux";
import { deletepop } from "../../redux/Slices/EmployeeSlice";
import {
  useDeleteUserMutation,
  useGetUsersMutation,
  useUpdateUserMutation,
} from "../../redux/Services/EmployeeApi";

const Employees = () => {
  const [selectedPosition, setSelectedPosition] = useState(""); // State for filter dropdown
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [employeeData, setEmployeeData] = useState([]);
  const positionOptions = ["Designer", "Developer", "Human Resources"];
  const [editemployeepop, setEditemployeepop] = useState(false);
  const id = useSelector((state) => state.employeeId.id);
  const [getUsers, { isError, isLoading }] = useGetUsersMutation();
  const columns = [
    { header: "", accessor: "SquareDiv" },
    { header: "Profile", accessor: "profile" },
    { header: "Employee Name", accessor: "employeeName" },
    { header: "Email Address", accessor: "email" },
    { header: "Phone Number", accessor: "phoneNumber" },
    { header: "Position", accessor: "position" },
    { header: "Department", accessor: "department" },

    { header: "Date of Joining", accessor: "date" },
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

  const fields = [
    {
      name: "employeeName",
      type: "text",
      placeholder: "Full Name",
    },
    {
      name: "email",
      type: "email",
      placeholder: "Email",
    },
    {
      name: "phoneNumber",
      type: "tel",
      placeholder: "Phone Number",
    },
    {
      name: "department",
      type: "text",
      placeholder: "Department",
    },
    {
      name: "position",
      type: "text",
      placeholder: "Position",
    },
    {
      name: "date",
      type: "date",
      placeholder: "Date",
    },
  ];

  function handleClosePopup() {
    setEditemployeepop(false);
  }
  const [updateUser, { issError, issLoading }] = useUpdateUserMutation();
  const handleUpdateEmployee = async (formData) => {
    console.log(formData, "formdata");
    for (let key in formData) {
      if (
        formData[key] === "" ||
        formData[key] === undefined ||
        formData[key] === null
      ) {
        delete formData[key];
      }
    }

    try {
      const body = formData;
      const response = await updateUser({ id, body });

      fetchCandidates();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const delpop = useSelector((state) => state.employeeId.delete);
  const dispatch = useDispatch();

  const [deleteUser, { iError, iLoading }] = useDeleteUserMutation();

  const handleDeleteEmployee = async () => {
    try {
      const response = await deleteUser(id);

      fetchCandidates();
    } catch (error) {
      console.log("NHK");
      console.error("Error:", error);
    }
  };
  if (delpop === true) {
    handleDeleteEmployee();
    dispatch(deletepop());
  }

  const updatedTableData = employeeData.map((employee, index) => ({
    ...employee,
    Sno: index + 1,
    profile: (
      <img
        src={`http://localhost:5000/uploads/${employee.image}`}
        alt="Profile"
        style={{ height: "30px", width: "30px", borderRadius: "20px" }}
        className={styles.profileImg}
      />
    ),
    SquareDiv: <div className={styles.squareDiv} />,
    edit: <img src={Vertical} alt="Delete" style={{ cursor: "pointer" }} />,
  }));
  console.log(updatedTableData, "updated empl data");
  const handlePositionChange = (e) => setSelectedPosition(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

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
          name="Employees"
          setEditemployeepop={setEditemployeepop}
        />
      </div>
      {editemployeepop && (
        <PopupForm
          isOpen={editemployeepop}
          onClose={handleClosePopup}
          title="Edit Employee Details"
          fields={fields}
          onSave={handleUpdateEmployee}
        />
      )}
    </div>
  );
};

export default Employees;
