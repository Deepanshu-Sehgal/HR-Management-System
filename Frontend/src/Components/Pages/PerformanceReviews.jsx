import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPerformanceReviews,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
} from "../../redux/Slices/PerformanceSlice";
import styles from "./PerformanceReviews.module.css";

function PerformanceReviews() {
  const dispatch = useDispatch();
  const { reviews, loading } = useSelector((state) => state.performance);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    reviewerName: "",
    reviewPeriod: "",
    performanceRating: 3,
    goals: "",
    achievements: "",
    areasForImprovement: "",
    feedback: "",
    salary_increment: 0,
    promotion: "None",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchPerformanceReviews());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updatePerformanceReview({ id: editingId, data: formData }));
      setEditingId(null);
    } else {
      dispatch(createPerformanceReview(formData));
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      employeeName: "",
      reviewerName: "",
      reviewPeriod: "",
      performanceRating: 3,
      goals: "",
      achievements: "",
      areasForImprovement: "",
      feedback: "",
      salary_increment: 0,
      promotion: "None",
    });
    setShowForm(false);
  };

  const handleEdit = (review) => {
    setFormData(review);
    setEditingId(review._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      dispatch(deletePerformanceReview(id));
    }
  };

  return (
    <div className={styles.container}>
      <h1>Performance Reviews</h1>
      <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
        {showForm ? "Cancel" : "Add Review"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="employeeId"
            placeholder="Employee ID"
            value={formData.employeeId}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="employeeName"
            placeholder="Employee Name"
            value={formData.employeeName}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="reviewerName"
            placeholder="Reviewer Name"
            value={formData.reviewerName}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="reviewPeriod"
            placeholder="Review Period (e.g., Q1 2024)"
            value={formData.reviewPeriod}
            onChange={handleInputChange}
            required
          />
          <select
            name="performanceRating"
            value={formData.performanceRating}
            onChange={handleInputChange}
          >
            <option value="1">1 - Poor</option>
            <option value="2">2 - Below Average</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Good</option>
            <option value="5">5 - Excellent</option>
          </select>
          <textarea
            name="goals"
            placeholder="Goals"
            value={formData.goals}
            onChange={handleInputChange}
          />
          <textarea
            name="achievements"
            placeholder="Achievements"
            value={formData.achievements}
            onChange={handleInputChange}
          />
          <textarea
            name="areasForImprovement"
            placeholder="Areas for Improvement"
            value={formData.areasForImprovement}
            onChange={handleInputChange}
          />
          <textarea
            name="feedback"
            placeholder="Feedback"
            value={formData.feedback}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="salary_increment"
            placeholder="Salary Increment %"
            value={formData.salary_increment}
            onChange={handleInputChange}
          />
          <button type="submit">{editingId ? "Update" : "Create"}</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Reviewer</th>
              <th>Period</th>
              <th>Rating</th>
              <th>Salary Increment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id}>
                <td>{review.employeeName}</td>
                <td>{review.reviewerName}</td>
                <td>{review.reviewPeriod}</td>
                <td>{review.performanceRating}/5</td>
                <td>{review.salary_increment}%</td>
                <td>
                  <button
                    onClick={() => handleEdit(review)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PerformanceReviews;
