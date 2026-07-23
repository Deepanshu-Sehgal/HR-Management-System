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
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
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
      const body = {};
      if (selectedPosition) {
        body.department = selectedPosition;
      }
      if (searchTerm) {
        body.searchTerm = searchTerm.trim();
      }

      const response = await getUsers(body);
      setEmployeeData(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCandidates();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedPosition, searchTerm]);

  const exportEmployeesCsv = () => {
    if (!employeeData.length) return;

    const headers = [
      "Employee Name",
      "Email",
      "Phone Number",
      "Department",
      "Position",
      "Experience",
      "Date of Joining",
      "Status",
    ];

    const rows = employeeData.map((employee) => [
      employee.employeeName,
      employee.email,
      employee.phoneNumber,
      employee.department,
      employee.position,
      employee.experience,
      employee.date,
      employee.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "employees.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

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
      name: "experience",
      type: "text",
      placeholder: "Experience",
    },
    {
      name: "date",
      type: "date",
      placeholder: "Date of Joining",
    },
    {
      name: "image",
      type: "file",
      placeholder: "Upload Profile Image",
    },
  ];

  function handleClosePopup() {
    setEditemployeepop(false);
  }
  const [updateUser, { issError, issLoading }] = useUpdateUserMutation();
  const [addUser, { isLoading: addLoading }] = useAddUserMutation();

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
      await updateUser({ id, body });
      fetchCandidates();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSaveEmployee = async (formData) => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      await addUser(formDataToSend);
      fetchCandidates();
      setIsAddPopupOpen(false);
    } catch (error) {
      console.error("Error onboarding employee:", error);
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
                placeholder="Search by name, email, department, or position"
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
            <button
              className={styles.addButton}
              onClick={() => setIsAddPopupOpen(true)}
              style={{ marginRight: 12 }}
            >
              Add Employee
            </button>
            <button
              className={styles.addButton}
              onClick={exportEmployeesCsv}
              style={{ background: "#1C982E" }}
            >
              Export CSV
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ color: "#4b5563", fontSize: 14 }}>
            Showing {employeeData.length} employee{employeeData.length === 1 ? "" : "s"}
            {selectedPosition ? ` in ${selectedPosition}` : ""}
            {searchTerm ? ` matching "${searchTerm}"` : ""}
          </div>
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            {isLoading ? "Refreshing..." : "Data is up to date"}
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
      {isAddPopupOpen && (
        <PopupForm
          isOpen={isAddPopupOpen}
          onClose={() => setIsAddPopupOpen(false)}
          title="Onboard New Employee"
          fields={fields}
          onSave={handleSaveEmployee}
        />
      )}
    </div>
  );
};

export default Employees;
