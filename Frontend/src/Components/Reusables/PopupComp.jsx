//by Paras

import React, { useState } from "react";
import "./popupcomp.css";
import { useDispatch } from "react-redux";
import {
  changeStatusEmp,
  changeWorkingEmp,
  deletepop,
} from "../../redux/Slices/EmployeeSlice";
import { changeStatus, changeWorking } from "../../redux/Slices/CandidateSlice";
import {
  changeLeaveId,
  changeLeaveStatus,
  changeLeaveWorking,
} from "../../redux/Slices/LeaveSlice";
import { useNavigate } from "react-router-dom";

const PopupComp = ({ popData, name, setEditemployeepop }) => {
  const data = popData;
  const dispatch = useDispatch();
  let classnme = "";
  if (name === "Employees") {
    classnme = "employeepop";
  } else if (name === "Attendance") {
    classnme = "attendancepop";
  } else if (name === "Leaves") {
    classnme = "leavepop";
  } else {
    classnme = "popupcomp";
  }
  const navigate = useNavigate();
  return (
    <div className={classnme} onClick={(e) => e.stopPropagation()}>
      {data.map((d, i) => (
        <div
          key={i}
          onMouseDown={() => {
            if (name === "Candidates") {
              dispatch(changeStatus(d));
              dispatch(changeWorking(true));
              if (d === "Selected") {
                navigate("/dashboard/employees");
              }
            } else if (name === "Employees") {
              if (d === "Edit") {
                setEditemployeepop(true);
              } else if (d == "Delete") {
                dispatch(deletepop());
              }
            } else if (name === "Attendance") {
              dispatch(changeStatusEmp(d));
              dispatch(changeWorkingEmp(true));
            } else if (name === "Leaves") {
              dispatch(changeLeaveStatus(d));
              dispatch(changeLeaveWorking(true));
            }
          }}
        >
          {d}
        </div>
      ))}
    </div>
  );
};

export default PopupComp;
