import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobOpenings, createJobOpening } from "../../redux/Slices/JobOpeningSlice";
import apiClient from "../../utils/apiClient";
import styles from "./Recruitment.module.css";

function Recruitment() {
  const dispatch = useDispatch();
  const { jobOpenings, loading } = useSelector((state) => state.jobOpening);
  const [showForm, setShowForm] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [formData, setFormData] = useState({
    jobTitle: "",
    department: "",
    description: "",
    responsibilities: "",
    qualifications: "",
    requiredSkills: "",
    salaryMin: "",
    salaryMax: "",
    experience: "",
    location: "",
    jobType: "Full-time",
    numberOfPositions: 1,
  });

  useEffect(() => {
    dispatch(fetchJobOpenings());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const parseList = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      jobTitle: formData.jobTitle,
      department: formData.department,
      description: formData.description,
      responsibilities: parseList(formData.responsibilities),
      qualifications: parseList(formData.qualifications),
      requiredSkills: parseList(formData.requiredSkills),
      salaryRange: {
        min: Number(formData.salaryMin) || 0,
        max: Number(formData.salaryMax) || 0,
      },
      jobType: formData.jobType,
      location: formData.location,
      experience: formData.experience,
      numberOfPositions: Number(formData.numberOfPositions) || 1,
    };

    dispatch(createJobOpening(payload));
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      department: "",
      description: "",
      responsibilities: "",
      qualifications: "",
      requiredSkills: "",
      salaryMin: "",
      salaryMax: "",
      experience: "",
      location: "",
      jobType: "Full-time",
      numberOfPositions: 1,
    });
    setShowForm(false);
  };

  const handleMatchEmployees = async (job) => {
    setSelectedJob(job);
    setMatchLoading(true);
    setMatchError("");
    setMatches([]);

    try {
      const response = await apiClient.get(`/job-openings/${job._id}/match`);
      setMatches(response.data.matchedEmployees || []);
    } catch (error) {
      setMatchError(error.response?.data?.message || "Unable to fetch matched employees.");
    } finally {
      setMatchLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1>Job Recruitment</h1>
        <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
          {showForm ? "Cancel" : "Post Job Opening"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <input
              type="text"
              name="jobTitle"
              placeholder="Job Title"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleInputChange}
              required
            />
          </div>

          <textarea
            name="description"
            placeholder="Job Description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />

          <div className={styles.formRow}>
            <input
              type="text"
              name="requiredSkills"
              placeholder="Required Skills (comma-separated)"
              value={formData.requiredSkills}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="responsibilities"
              placeholder="Responsibilities (comma-separated)"
              value={formData.responsibilities}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <input
              type="text"
              name="qualifications"
              placeholder="Qualifications (comma-separated)"
              value={formData.qualifications}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="experience"
              placeholder="Experience Required"
              value={formData.experience}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formRow}>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleInputChange}
            />
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleInputChange}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <input
              type="number"
              name="salaryMin"
              placeholder="Salary Min"
              value={formData.salaryMin}
              onChange={handleInputChange}
              min="0"
            />
            <input
              type="number"
              name="salaryMax"
              placeholder="Salary Max"
              value={formData.salaryMax}
              onChange={handleInputChange}
              min="0"
            />
            <input
              type="number"
              name="numberOfPositions"
              placeholder="Number of Positions"
              value={formData.numberOfPositions}
              onChange={handleInputChange}
              min="1"
            />
          </div>

          <button type="submit">Post Job</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.jobsGrid}>
          {jobOpenings.map((job) => (
            <div key={job._id} className={styles.jobCard}>
              <h3>{job.jobTitle}</h3>
              <p>
                <strong>Department:</strong> {job.department}
              </p>
              <p>
                <strong>Location:</strong> {job.location}
              </p>
              <p>
                <strong>Type:</strong> {job.jobType}
              </p>
              <p>
                <strong>Positions:</strong> {job.numberOfPositions}
              </p>
              <p>
                <strong>Status:</strong> {job.status}
              </p>
              {job.salaryRange ? (
                <p>
                  <strong>Salary:</strong> ${job.salaryRange.min} - ${job.salaryRange.max}
                </p>
              ) : null}
              <p className={styles.description}>{job.description}</p>
              <div className={styles.skillList}>
                {(job.requiredSkills || []).map((skill) => (
                  <span key={skill} className={styles.skillPill}>
                    {skill}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className={styles.matchBtn}
                onClick={() => handleMatchEmployees(job)}
              >
                Match Employees
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <div className={styles.matchPanel}>
          <div className={styles.matchHeader}>
            <h2>Matches for: {selectedJob.jobTitle}</h2>
            <p>
              Required Skills: {selectedJob.requiredSkills?.join(", ") || "None"}
            </p>
          </div>

          {matchLoading ? (
            <p>Finding best-matched employees...</p>
          ) : matchError ? (
            <p className={styles.errorMessage}>{matchError}</p>
          ) : matches.length ? (
            <div className={styles.matchGrid}>
              {matches.map((match) => (
                <div key={match.employeeId} className={styles.matchCard}>
                  <h4>{match.employeeName}</h4>
                  <p>
                    <strong>Match Score:</strong> {match.matchPercentage}%
                  </p>
                  <p>
                    <strong>Position:</strong> {match.position}
                  </p>
                  <div className={styles.skillList}>
                    {(match.matchedSkills || []).map((skill) => (
                      <span key={skill.skillName} className={styles.skillPill}>
                        {skill.skillName} ({skill.proficiencyLevel})
                      </span>
                    ))}
                  </div>
                  {match.missingSkills?.length ? (
                    <p className={styles.missingSkills}>
                      Missing: {match.missingSkills.join(", ")}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p>No qualified matches found yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Recruitment;
