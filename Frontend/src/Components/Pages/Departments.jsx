import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../redux/Slices/DepartmentSlice";
import styles from "./Departments.module.css";

function Departments() {
  const dispatch = useDispatch();
  const { departments, loading } = useSelector((state) => state.department);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    departmentName: "",
    departmentCode: "",
    manager: "",
    description: "",
    budget: 0,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateDepartment({ id: editingId, data: formData }));
      setEditingId(null);
    } else {
      dispatch(createDepartment(formData));
    }
    setFormData({
      departmentName: "",
      departmentCode: "",
      manager: "",
      description: "",
      budget: 0,
    });
    setShowForm(false);
  };

  const handleEdit = (dept) => {
    setFormData(dept);
    setEditingId(dept._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      dispatch(deleteDepartment(id));
    }
  };

  return (
    <div className={styles.container}>
      <h1>Department Management</h1>
      <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
        {showForm ? "Cancel" : "Add Department"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="departmentName"
            placeholder="Department Name"
            value={formData.departmentName}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="departmentCode"
            placeholder="Department Code"
            value={formData.departmentCode}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="manager"
            placeholder="Manager Name"
            value={formData.manager}
            onChange={handleInputChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="budget"
            placeholder="Budget"
            value={formData.budget}
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
              <th>Name</th>
              <th>Code</th>
              <th>Manager</th>
              <th>Budget</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept._id}>
                <td>{dept.departmentName}</td>
                <td>{dept.departmentCode}</td>
                <td>{dept.manager}</td>
                <td>${dept.budget}</td>
                <td>
                  <button
                    onClick={() => handleEdit(dept)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
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

export default Departments;
