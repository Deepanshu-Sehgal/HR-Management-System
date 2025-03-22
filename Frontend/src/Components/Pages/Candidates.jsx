import React, { useState, useEffect, useCallback } from "react";
import ReusableTable from "../Reusables/ReusableTable";
import { Delete, Download, Search } from "../../assets";
import styles from "./Candidates.module.css";
import PopupForm from "../Reusables/PopupForm";
import { useDispatch, useSelector } from "react-redux";
import { changeWorking } from "../../redux/Slices/CandidateSlice";
import {
  useAddUserMutation,
  useDeleteUserMutation,
  useGetUsersMutation,
  useUpdateUserMutation,
} from "../../redux/Services/CandidateApi";

const Candidates = () => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([""]);
  const statusOptions = ["New", "Ongoing", "Selected", "Rejected"];
  const positionOptions = ["Designer", "Developer", "Human Resources"];
  const [getUsers, { isError, isLoadingg }] = useGetUsersMutation();

  const fetchCandidates = async () => {
    const body = {
      status: selectedStatus,
      department: selectedPosition,
    };

    try {
      const response = await getUsers(body);
      console.log(response, "data response");
      if (!isError) {
        console.log(response.data);
        setCandidates(response.data);
        setFilteredCandidates(response.data);
      } // Initially show all candidates
    } catch (isError) {
      console.error("Error fetching candidates:", error);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [selectedStatus, selectedPosition]);
  const [deleteUser, { issError, issLoading }] = useDeleteUserMutation();

  const handleDeleteCandidate = async (id) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        const response = await deleteUser(id);
        fetchCandidates();
        setCandidates((prev) =>
          prev.filter((candidate) => candidate._id !== id)
        );
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };
  const handleAddNewClick = () => setPopupOpen(true);
  const handleClosePopup = () => setPopupOpen(false);
  const [addUser, { error, isLoading }] = useAddUserMutation();
  const handleSaveCandidate = async (formData) => {
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }
    console.log(formDataToSend, "candidate formd data value");
    const data = await addUser(formDataToSend);
    if (error) {
      console.error("Error:", error);
    } else {
      console.log(data);
      fetchCandidates();
      setPopupOpen(false);
    }
  };
  const statusVal = useSelector((state) => state.candidate.status);
  const idd = useSelector((state) => state.candidate.id);
  const working = useSelector((state) => state.candidate.working);
  const dispatch = useDispatch();

  const [updateUser, { issErrorr, isLoadding }] = useUpdateUserMutation();

  const handleUpdateCandidate = async () => {
    const body = {
      status: statusVal,
    };
    try {
      const response = await updateUser({ idd, body }).unwrap();
      console.log(response, "response");

      fetchCandidates();
    } catch (error) {
      console.log("NHK");
      console.error("Error:", error);
    }
  };
  if (working) {
    handleUpdateCandidate();
    dispatch(changeWorking(false));
  }
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

  const columns = [
    { header: "", accessor: "SquareDiv" },
    { header: "S.no", accessor: "Sno" },
    { header: "Candidate Name", accessor: "candidateName" },
    { header: "Email", accessor: "email" },
    { header: "Phone Number", accessor: "phoneNumber" },
    { header: "Position", accessor: "department" },
    { header: "Status", accessor: "status" },
    { header: "Experience", accessor: "experience" },
    { header: "Resume", accessor: "resume" },
    { header: "", accessor: "DeleteIcon" },
  ];
  console.log(filteredCandidates, "updated candidates table");
  const updatedTableData = filteredCandidates.map((candidate, index) => ({
    ...candidate,
    Sno: index + 1,
    SquareDiv: (
      <div
        className={styles.squareDiv}
        style={
          candidate.status === "Rejected"
            ? {
                backgroundImage:
                  "linear-gradient(180deg, #FF3D3D 0%, #992525 100%)",
              }
            : candidate.status === "Ongoing"
            ? {
                backgroundImage:
                  "linear-gradient(180deg, #1C982E 0%, #0E4F17 100%)",
              }
            : candidate.status === "Selected"
            ? {
                backgroundImage:
                  "linear-gradient(180deg, #783FED 0%, #442487 100%)",
              }
            : candidate.status === "Scheduled"
            ? {
                backgroundImage:
                  "linear-gradient(180deg, #DAC400 0%, #D0BB00 100%)",
              }
            : { backgroundColor: "white" }
        }
      />
    ),
    DeleteIcon: (
      <img
        src={Delete}
        alt="Delete"
        style={{ cursor: "pointer" }}
        onClick={() => handleDeleteCandidate(candidate._id)}
      />
    ),
    resume: (
      <img
        src={Download}
        alt="Download"
        style={{ cursor: "pointer" }}
        onClick={() => handleDownloadResume(candidate.resume)}
      />
    ),
  }));

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleSearch = (term) => {
    setSearchTerm(term);

    const filtered = candidates.filter((candidate) =>
      Object.values(candidate).some((value) =>
        String(value).toLowerCase().includes(term.toLowerCase())
      )
    );
    setFilteredCandidates(filtered);
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 100), [
    candidates,
  ]);

  const fields = [
    {
      name: "candidateName",
      type: "text",
      placeholder: "Candidate Name",
      required: true,
    },
    { name: "email", type: "email", placeholder: "Email", required: true },
    {
      name: "phoneNumber",
      type: "tel",
      placeholder: "Phone Number",
      required: true,
    },
    {
      name: "department",
      type: "text",
      placeholder: "Department",
      required: true,
    },
    {
      name: "experience",
      type: "number",
      placeholder: "Experience",
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

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <div className={styles.navbar}>
          <div className={styles.navLeft}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All</option>
              {statusOptions.map((status, index) => (
                <option
                  key={index}
                  value={status}
                  onClick={() => setFilterstatus(status)}
                >
                  {status}
                </option>
              ))}
            </select>

            <select
              value={selectedPosition}
              onChange={(e) => {
                setSelectedPosition(e.target.value);
                setFilterposition(position);
              }}
            >
              <option value="">All</option>
              {positionOptions.map((position, index) => (
                <option
                  key={index}
                  value={position}
                  onClick={() => {
                    console.log(position, "position");
                  }}
                >
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.navRight}>
            <div className={styles.searchWrapper}>
              <img src={Search} alt="Search" className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => debouncedSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button className={styles.addButton} onClick={handleAddNewClick}>
              Add New Candidate
            </button>
          </div>
        </div>

        <ReusableTable
          navItems={[]}
          tableData={updatedTableData}
          columns={columns}
          name="Candidates"
        />
      </div>

      <PopupForm
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        title="Add New Candidate"
        fields={fields}
        onSave={handleSaveCandidate}
      />
    </div>
  );
};

export default Candidates;
