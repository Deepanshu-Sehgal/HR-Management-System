// src/Components/ReusableTable.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./ReusableTable.module.css"; // Import your CSS module
import PopupComp from "./PopupComp";
import PopupForm from "./PopupForm";
import { useDispatch } from "react-redux";
import { changeId } from "../../redux/Slices/EmployeeSlice";
import { changeCandidateId } from "../../redux/Slices/CandidateSlice";
import { changeLeaveId } from "../../redux/Slices/LeaveSlice";

const ReusableTable = ({
  navItems = [],
  tableData = [],
  columns = [],
  name,
  setEditemployeepop,
  newtask,
}) => {
  const [editableCell, setEditableCell] = useState(null);
  const [taskValue, setTaskValue] = useState("");

  const handleTaskClick = (rowIndex, cellIndex, initialValue, rid) => {
    setEditableCell({ rowIndex, cellIndex });
    setTaskValue(initialValue);
    dispatch(changeId(rid));
  };

  const handleTaskChange = (e) => {
    setTaskValue(e.target.value);
  };

  const handleTaskBlur = () => {
    console.log("New task value:", taskValue);
    setEditableCell(null);
  };

  const dispatch = useDispatch();
  const [popupData, setPopupData] = useState([]);

  const [cell, setCell] = useState(null);
  const [roww, setRoww] = useState(null);
  const [pop, setPop] = useState(false);
  function OpenPopUp(rowIndex, cellIndex, tblenumb, rid) {
    switch (tblenumb) {
      case "1":
        dispatch(changeCandidateId(rid));
        setPopupData(["Scheduled", "Selected", "Rejected", "Ongoing"]);
        break;
      case "2":
        dispatch(changeId(rid));
        setPopupData(["Edit", "Delete"]);
        break;
      case "3":
        dispatch(changeId(rid));
        setPopupData(["Present", "Absent", "Medical Leave", "Work from Home"]);
        break;
      default:
        dispatch(changeLeaveId(rid));
        setPopupData(["Approved", "Rejected", "Pending"]);
    }
    setCell(cellIndex);
    setRoww(rowIndex);
    if (pop) {
      setPop(false);
    } else {
      setPop(true);
    }
  }
  function handleenter(e) {
    if (e.key === "Enter") {
      newtask(taskValue);
      setEditableCell(null);
    }
  }
  const navigate = useNavigate();
  // function updateStatus(rowIndex, newStatus, row) {
  //   handleUpdateCandidate(row, newStatus);
  //   console.log(row, "rowid");
  //   const updatedStatusValues = [...statusValues];
  //   updatedStatusValues[rowIndex] = newStatus;

  //   setStatusValues(updatedStatusValues);
  //   if (newStatus === "Selected") {
  //     navigate("/dashboard/employees");
  //   }
  //   ClosePopUp();
  // }

  function ClosePopUp() {
    setPop(false);
  }
  return (
    <div className={styles.reusableTable}>
      <div className={styles.nav}>
        {navItems.map((item, index) => (
          <div key={index} className={styles.navItemWrapper}>
            <Link to={item.link} className={styles.navItem}>
              {item.label}
            </Link>
          </div>
        ))}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            {name === "Leaves" && (
              <tr>
                <th
                  colSpan={columns.length}
                  className={
                    name === "Leaves"
                      ? styles.simpleHeader
                      : styles.gradientHeader
                  } // Conditional class based on page
                >
                  <h2 className={styles.tableHeader}>{name}</h2>
                </th>
              </tr>
            )}
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={
                    name === "Leaves"
                      ? styles.simpleHeader
                      : styles.gradientHeader
                  }
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData ? (
              tableData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={
                    row.status == "Selected"
                      ? { color: "red" }
                      : { color: "white" }
                  }
                >
                  {columns.map((column, cellIndex) => (
                    <>
                      <td
                        key={cellIndex}
                        tabIndex={0}
                        onClick={
                          name === "Candidates"
                            ? column.accessor === "status"
                              ? () =>
                                  OpenPopUp(rowIndex, cellIndex, "1", row._id)
                              : undefined
                            : name === "Employees"
                            ? column.accessor === "edit"
                              ? () =>
                                  OpenPopUp(rowIndex, cellIndex, "2", row._id)
                              : undefined
                            : name === "Attendance"
                            ? column.accessor === "status"
                              ? () =>
                                  OpenPopUp(rowIndex, cellIndex, "3", row._id)
                              : column.accessor === "task"
                              ? () =>
                                  handleTaskClick(
                                    rowIndex,
                                    cellIndex,
                                    row[column.accessor],
                                    row._id
                                  )
                              : undefined
                            : name === "Leaves"
                            ? column.accessor === "status"
                              ? () =>
                                  OpenPopUp(rowIndex, cellIndex, "4", row._id)
                              : undefined
                            : undefined
                        }
                        onBlur={ClosePopUp}
                        style={
                          (name === "Candidates" &&
                            column.accessor === "status") ||
                          (name === "Employees" &&
                            column.accessor === "edit") ||
                          (name === "Attendance" &&
                            column.accessor === "status") ||
                          (name === "Leaves" && column.accessor === "status")
                            ? { cursor: "pointer" }
                            : { cursor: "default" }
                        }
                      >
                        {editableCell &&
                        editableCell.rowIndex === rowIndex &&
                        editableCell.cellIndex === cellIndex ? (
                          <input
                            type="text"
                            value={taskValue}
                            onChange={handleTaskChange}
                            onBlur={handleTaskBlur}
                            onKeyDown={handleenter}
                            autoFocus
                          />
                        ) : (
                          <span
                            style={
                              name != "Employees"
                                ? row.status === "Rejected" ||
                                  row.status === "Absent"
                                  ? {
                                      color: `#FF3D3D`,
                                    }
                                  : row.status === "Ongoing"
                                  ? {
                                      color: "#1C982E",
                                    }
                                  : row.status === "Selected"
                                  ? {
                                      color: "#783FED",
                                    }
                                  : row.status === "Medical Leave"
                                  ? {
                                      color: "#DAC400",
                                    }
                                  : row.status === "Scheduled"
                                  ? {
                                      color: "#DAC400",
                                    }
                                  : column.accessor === "status" &&
                                    row.status === "Work from Home"
                                  ? { color: "#62C9CD" }
                                  : column.accessor === "status" &&
                                    row.status === "Present"
                                  ? { color: "#1C982E" }
                                  : { color: "#121212" }
                                : undefined
                            }
                          >
                            {row[column.accessor]}
                          </span>
                        )}
                        {pop && roww === rowIndex && cell === cellIndex && (
                          <PopupComp
                            popData={popupData}
                            setEditemployeepop={setEditemployeepop}
                            name={name}
                            // setStatusValues={setStatusValues}
                            // updateStatus={(newStatus) =>
                            //   updateStatus(rowIndex, newStatus, row._id)
                            // }
                          />
                        )}
                      </td>
                    </>
                  ))}
                </tr>
              ))
            ) : (
              <></>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReusableTable;
