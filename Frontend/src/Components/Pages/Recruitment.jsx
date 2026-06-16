import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobOpenings, createJobOpening } from "../../redux/Slices/JobOpeningSlice";
import styles from "./Recruitment.module.css";

function Recruitment() {
  const dispatch = useDispatch();
  const { jobOpenings, loading } = useSelector((state) => state.jobOpening);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    department: "",
    description: "",
    qualifications: "",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createJobOpening(formData));
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      department: "",
      description: "",
      qualifications: "",
      experience: "",
      location: "",
      jobType: "Full-time",
      numberOfPositions: 1,
    });
    setShowForm(false);
  };

  return (
    <div className={styles.container}>
      <h1>Job Recruitment</h1>
      <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
        {showForm ? "Cancel" : "Post Job Opening"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
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
          <textarea
            name="description"
            placeholder="Job Description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="qualifications"
            placeholder="Qualifications"
            value={formData.qualifications}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="experience"
            placeholder="Required Experience"
            value={formData.experience}
            onChange={handleInputChange}
          />
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
          <input
            type="number"
            name="numberOfPositions"
            placeholder="Number of Positions"
            value={formData.numberOfPositions}
            onChange={handleInputChange}
          />
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
              <p className={styles.description}>{job.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Recruitment;
