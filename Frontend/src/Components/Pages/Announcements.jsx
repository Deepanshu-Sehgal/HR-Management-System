import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
} from "../../redux/Slices/AnnouncementSlice";
import styles from "./Announcements.module.css";

function Announcements() {
  const dispatch = useDispatch();
  const { announcements, loading } = useSelector((state) => state.announcement);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
    category: "Company",
    priority: "Medium",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      dispatch(updateAnnouncement({ id: editingId, data: formData }));
      setEditingId(null);
    } else {
      dispatch(createAnnouncement(formData));
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      author: "",
      category: "Company",
      priority: "Medium",
    });
    setShowForm(false);
  };

  const handleEdit = (announcement) => {
    setFormData(announcement);
    setEditingId(announcement._id);
    setShowForm(true);
  };

  return (
    <div className={styles.container}>
      <h1>Announcements</h1>
      <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
        {showForm ? "Cancel" : "New Announcement"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="title"
            placeholder="Announcement Title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Announcement Description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="author"
            placeholder="Author"
            value={formData.author}
            onChange={handleInputChange}
            required
          />
          <select name="category" value={formData.category} onChange={handleInputChange}>
            <option value="Company">Company</option>
            <option value="Department">Department</option>
            <option value="Urgent">Urgent</option>
            <option value="Event">Event</option>
          </select>
          <select name="priority" value={formData.priority} onChange={handleInputChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button type="submit">{editingId ? "Update" : "Post"}</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.announcementsList}>
          {announcements.map((announcement) => (
            <div key={announcement._id} className={styles.announcementCard}>
              <div className={styles.header}>
                <h3>{announcement.title}</h3>
                <span className={`${styles.priority} ${styles[announcement.priority]}`}>
                  {announcement.priority}
                </span>
              </div>
              <p>{announcement.description}</p>
              <div className={styles.meta}>
                <span>By: {announcement.author}</span>
                <span>Category: {announcement.category}</span>
              </div>
              <button
                onClick={() => handleEdit(announcement)}
                className={styles.editBtn}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Announcements;
