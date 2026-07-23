import React, { useState, useCallback, useRef, useEffect } from "react";
import ReusableTable from "../Reusables/ReusableTable";
import {
  File,
  Search,
  Profile,
  CalenderEvent,
  leavesdownload,
} from "../../assets";
import styles from "./Leaves.module.css";
import PopupForm from "../Reusables/PopupForm";
import { useDispatch, useSelector } from "react-redux";
import { changeLeaveWorking } from "../../redux/Slices/LeaveSlice";
import {
  useAddUserMutation,
  useGetUsersbydateMutation,
  useGetUsersMutation,
  useUpdateUserMutation,
  useGetLeaveSummaryQuery,
} from "../../redux/Services/LeaveApi";

const Leaves = () => {
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveData, setLeave] = useState([]);
  const [selectedDate, setSelectedDate] = useState(""); // State for selected date
  const dateInputRef = useRef(null);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [datedata, setDatedata] = useState([]);
  const statusOptions = ["Rejected", "Pending", "Approved"];

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  function reverseDate(date) {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }
  const [getUsersbydate, { isErrorr, isLoadingg }] =
    useGetUsersbydateMutation();
  async function fetchfilterdata() {
    try {
      const body = {
        date: reverseDate(selectedDate),
      };

      const response = await getUsersbydate(body);

      setDatedata(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  }

  // Set current date as default on load
  useEffect(() => {
    setSelectedDate(getCurrentDate());
    fetchfilterdata();
  }, []);
  useEffect(() => {
    fetchfilterdata();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Open date picker when calendar icon is clicked
  const openDatePicker = () => {
    dateInputRef.current.showPicker(); // Trigger date picker
  };
  const handleAddNewClick = () => setPopupOpen(true);
  const columns = [
    { header: " ", accessor: "profile" },
    { header: "Name", accessor: "name" },
    { header: "Date", accessor: "leavedate" },
    { header: "Reason", accessor: "reason" },
    { header: "Status", accessor: "status" },
    { header: "Docs", accessor: "resume" },
  ];
  const [getUsers, { isError, isLoading }] = useGetUsersMutation();
  const { data: leaveSummary, isLoading: summaryLoading } = useGetLeaveSummaryQuery();

  const fetchCandidates = async () => {
    try {
      const body = {
        status: selectedStatus,
      };
      console.log(" fetch data");
      const response = await getUsers(body);

      setLeave(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [selectedStatus]);
  const statusVal = useSelector((state) => state.leave.status);
  const idd = useSelector((state) => state.leave.id);
  const working = useSelector((state) => state.leave.working);
  const dispatch = useDispatch();
  const [reviewComment, setReviewComment] = useState("");
  const [updateUser, { err, load }] = useUpdateUserMutation();
  const handleUpdateCandidate = async () => {
    try {
      const body = {
        status: statusVal,
      };
      if (reviewComment.trim()) {
        body.reviewComment = reviewComment.trim();
      }
      const response = await updateUser({ idd, body });

      fetchCandidates();
      setReviewComment("");
    } catch (error) {
      console.log("NHK");
      console.error("Error:", error);
    }
  };
  if (working) {
    handleUpdateCandidate();
    dispatch(changeLeaveWorking(false));
  }
  const [addUser, { e, l }] = useAddUserMutation();
  const handleSaveCandidate = async (formData) => {
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    console.log(formDataToSend, "form data of leave");
    try {
      const response = await addUser(formDataToSend);

      fetchCandidates();
      setPopupOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleStatusChange = (e) => setSelectedStatus(e.target.value);
  const handleClosePopup = () => setPopupOpen(false);
  const handleReviewCommentChange = (e) => setReviewComment(e.target.value);
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleDownloadResume = async (resumeFileName) => {
    const url = `/api/download-resume/${resumeFileName}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to download the resume");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = resumeFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading resume:", error);
    }
  };

  const debouncedSearch = useCallback(
    debounce((term) => setSearchTerm(term), 300),
    []
  );

  const fields = [
    {
      name: "name",
      type: "text",
      placeholder: "Candidate Name",
      required: true,
    },
    {
      name: "department",
      type: "text",
      placeholder: "Department",
      required: true,
    },
    {
      name: "leavedate1",
      type: "date",
      placeholder: "Date",
      required: true,
    },
    {
      name: "leavedate2",
      type: "date",
      placeholder: "Date",
      required: true,
    },
    {
      name: "reason",
      type: "text",
      placeholder: "Reason",
      required: true,
    },
    {
      name: "resume",
      type: "file",
      placeholder: "Upload Resume",
      required: true,
    },
    {
      name: "image",
      type: "file",
      placeholder: "Upload Image",
      required: true,
    },
  ];

  console.log(leaveData, "Candidate resume");
  const updatedTableData = leaveData.map((candidate, index) => ({
    ...candidate,
    profile: (
      <img
        src={`http://localhost:5000/uploads/${candidate.image}`}
        alt="Profile"
        style={{ height: "30px", width: "30px", borderRadius: "20px" }}
        className={styles.profileImg}
      />
    ),
    resume: (
      <img
        src={leavesdownload}
        alt="Download"
        style={{ cursor: "pointer" }}
        onClick={() => handleDownloadResume(candidate.resume)}
      />
    ),
  }));

  const filteredTableData = updatedTableData.filter((row) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      row.name?.toLowerCase().includes(lowerSearch) ||
      row.department?.toLowerCase().includes(lowerSearch) ||
      row.reason?.toLowerCase().includes(lowerSearch) ||
      row.status?.toLowerCase().includes(lowerSearch)
    );
  });

  console.log(datedata, "leaves updated data");
  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <div className={styles.leftSectionNav}>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className={styles.statusDropdown}
          >
            {statusOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={reviewComment}
            onChange={handleReviewCommentChange}
            placeholder="Review comment"
            className={styles.commentInput}
          />
        </div>

        <div className={styles.rightSectionNav}>
          <div className={styles.searchWrapper}>
            <img src={Search} alt="Search" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search"
              onChange={(e) => debouncedSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button className={styles.addButton} onClick={handleAddNewClick}>
            Add New Leave
          </button>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryTitle}>Total Leaves</p>
          <p className={styles.summaryValue}>{leaveSummary?.total ?? 0}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryTitle}>Pending</p>
          <p className={styles.summaryValue}>{leaveSummary?.pending ?? 0}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryTitle}>Approved</p>
          <p className={styles.summaryValue}>{leaveSummary?.approved ?? 0}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryTitle}>Rejected</p>
          <p className={styles.summaryValue}>{leaveSummary?.rejected ?? 0}</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.tableContainer}>
            <ReusableTable
              columns={columns}
              tableData={filteredTableData}
              name="Leaves"
            />
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.calendar}>
            <h2 className={styles.calendarTitle}>Leave Calendar</h2>
            <div className={styles.calendarControls}>
              <button
                className={styles.todayButton}
                onClick={() => {
                  setSelectedDate(getCurrentDate());
                }}
              >
                Today
              </button>
              <div className={styles.calendarInputWrapper}>
                <img
                  src={CalenderEvent}
                  alt="calendar icon"
                  className={styles.customCalendarIcon}
                  onClick={openDatePicker}
                />
                <input
                  type="date"
                  ref={dateInputRef}
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={getCurrentDate()}
                  className={styles.calendarDateInput}
                />
              </div>
            </div>
            <div className={styles.entries}>
              {datedata.length > 0 ? (
                datedata.map((data, i) => (
                  <div key={i} className={styles.calendarEntry}>
                    <img
                      src={`http://localhost:5000/uploads/${data.image}`}
                      alt={data.name}
                      className={styles.profileImage}
                    />
                    <div>
                      <p>{data.name}</p>
                      <p>{data.department}</p>
                      <p>{data.leavedate}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.calendarEntry}>Nothing to Show</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <PopupForm
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        title="Add New Leave"
        fields={fields}
        onSave={handleSaveCandidate}
      />
    </div>
  );
};

export default Leaves;
