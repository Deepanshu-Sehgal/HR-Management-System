import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPages,
  createPage,
  updatePage,
  deletePage,
} from "../../redux/Slices/PageSlice";
import styles from "./ContentPages.module.css";

const defaultForm = {
  title: "",
  slug: "",
  section: "legal",
  subSection: "terms",
  status: "published",
  content: "",
};

const ContentPages = () => {
  const dispatch = useDispatch();
  const { pages, loading, error } = useSelector((state) => state.page);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(fetchPages());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await dispatch(updatePage({ id: editingId, data: form }));
      setMessage("Page updated successfully.");
    } else {
      await dispatch(createPage(form));
      setMessage("Page created successfully.");
    }
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleEdit = (page) => {
    setEditingId(page._id);
    setForm({
      title: page.title,
      slug: page.slug,
      section: page.section,
      subSection: page.subSection,
      status: page.status,
      content: page.content,
    });
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this page permanently?")) {
      await dispatch(deletePage(id));
      setMessage("Page deleted successfully.");
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setMessage("");
  };

  return (
    <div className={styles.contentManager}>
      <div className={styles.header}>
        <h1>Content Management</h1>
        <p>Edit landing pages and legal pages from the admin panel.</p>
      </div>

      <section className={styles.formSection}>
        <h2>{editingId ? "Edit Page" : "Create New Page"}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Slug
            <input name="slug" value={form.slug} onChange={handleChange} />
          </label>
          <label>
            Section
            <select name="section" value={form.section} onChange={handleChange}>
              <option value="landing">Landing</option>
              <option value="legal">Legal</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Subsection
            <select name="subSection" value={form.subSection} onChange={handleChange}>
              <option value="about">About</option>
              <option value="contact">Contact</option>
              <option value="privacy">Privacy</option>
              <option value="terms">Terms</option>
              <option value="cookie">Cookie</option>
              <option value="support">Support</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <label>
            Content
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={8}
              required
            />
          </label>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton}>
              {editingId ? "Update Page" : "Create Page"}
            </button>
            <button type="button" onClick={resetForm} className={styles.secondaryButton}>
              Reset
            </button>
          </div>
          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </section>

      <section className={styles.listSection}>
        <h2>Existing Pages</h2>
        {loading ? (
          <p>Loading pages...</p>
        ) : (
          <div className={styles.pageList}>
            {pages.length === 0 ? (
              <p>No pages created yet.</p>
            ) : (
              pages.map((page) => (
                <article key={page._id} className={styles.pageCard}>
                  <div>
                    <h3>{page.title}</h3>
                    <p>Slug: {page.slug}</p>
                    <p>Section: {page.section}</p>
                    <p>Subsection: {page.subSection}</p>
                    <p>Status: {page.status}</p>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => handleEdit(page)}>Edit</button>
                    <button onClick={() => handleDelete(page._id)} className={styles.deleteButton}>
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ContentPages;
