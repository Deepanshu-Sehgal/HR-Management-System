import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDocuments,
  uploadDocument,
  fetchExpiringDocuments,
  fetchExpiryStats,
  sendDocumentReminder,
  runDocumentExpirySweep,
} from "../../redux/Slices/DocumentSlice";
import styles from "./Documents.module.css";

const EXP_WINDOWS = [
  { label: "Next 30 days", value: 30 },
  { label: "Next 60 days", value: 60 },
  { label: "Next 90 days", value: 90 },
  { label: "Next year", value: 365 },
];

const expiryBadge = (days) => {
  if (days == null) return null;
  if (days < 0) return { cls: styles.expExpired, text: `Expired ${Math.abs(days)}d ago` };
  if (days === 0) return { cls: styles.expExpired, text: "Expires today" };
  if (days <= 30) return { cls: styles.expSoon, text: `In ${days}d` };
  return { cls: styles.expOk, text: `In ${days}d` };
};

function Documents() {
  const dispatch = useDispatch();
  const {
    documents,
    loading,
    expiring,
    expiryStats,
    sendingReminderId,
  } = useSelector((state) => state.document);

  const [showForm, setShowForm] = useState(false);
  const [expWindow, setExpWindow] = useState(30);
  const [notice, setNotice] = useState("");
  const [formData, setFormData] = useState({
    documentName: "",
    documentType: "Policy",
    description: "",
    fileUrl: "",
    uploadedBy: "",
    visibility: "Internal",
    tags: "",
    expiryDate: "",
    notifyEmail: "",
    reminderLeadDays: 30,
  });

  useEffect(() => {
    dispatch(fetchDocuments());
    dispatch(fetchExpiryStats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchExpiringDocuments(expWindow));
  }, [dispatch, expWindow]);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      reminderLeadDays: Number(formData.reminderLeadDays) || 30,
      expiryDate: formData.expiryDate || undefined,
      tags: formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim())
        : [],
    };
    await dispatch(uploadDocument(data));
    dispatch(fetchExpiryStats());
    dispatch(fetchExpiringDocuments(expWindow));
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      documentName: "",
      documentType: "Policy",
      description: "",
      fileUrl: "",
      uploadedBy: "",
      visibility: "Internal",
      tags: "",
      expiryDate: "",
      notifyEmail: "",
      reminderLeadDays: 30,
    });
    setShowForm(false);
  };

  const handleSendReminder = async (id) => {
    const res = await dispatch(sendDocumentReminder(id));
    if (sendDocumentReminder.fulfilled.match(res)) {
      flash(res.payload.message || "Reminder sent");
    } else {
      flash(res.error?.message || "Could not send reminder");
    }
  };

  const handleSweep = async () => {
    const res = await dispatch(runDocumentExpirySweep());
    if (runDocumentExpirySweep.fulfilled.match(res)) {
      flash(`Sweep done — ${res.payload.sent} sent, ${res.payload.skipped} skipped`);
      dispatch(fetchExpiringDocuments(expWindow));
      dispatch(fetchExpiryStats());
    } else {
      flash("Sweep failed");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Document Management</h1>
      <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
        {showForm ? "Cancel" : "Upload Document"}
      </button>

      {notice && <div className={styles.notice}>{notice}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="documentName"
            placeholder="Document Name"
            value={formData.documentName}
            onChange={handleInputChange}
            required
          />
          <select
            name="documentType"
            value={formData.documentType}
            onChange={handleInputChange}
          >
            <option value="Contract">Contract</option>
            <option value="Policy">Policy</option>
            <option value="Procedure">Procedure</option>
            <option value="Form">Form</option>
            <option value="Certificate">Certificate</option>
          </select>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="fileUrl"
            placeholder="File URL"
            value={formData.fileUrl}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="uploadedBy"
            placeholder="Uploaded By"
            value={formData.uploadedBy}
            onChange={handleInputChange}
            required
          />
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleInputChange}
          >
            <option value="Public">Public</option>
            <option value="Internal">Internal</option>
            <option value="Restricted">Restricted</option>
          </select>
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma-separated)"
            value={formData.tags}
            onChange={handleInputChange}
          />

          {/* Expiry reminder fields */}
          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span>Expiry date</span>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
              />
            </label>
            <label className={styles.field}>
              <span>Remind (days before)</span>
              <input
                type="number"
                name="reminderLeadDays"
                min="0"
                value={formData.reminderLeadDays}
                onChange={handleInputChange}
              />
            </label>
            <label className={styles.field}>
              <span>Notify email</span>
              <input
                type="email"
                name="notifyEmail"
                placeholder="who to remind (optional)"
                value={formData.notifyEmail}
                onChange={handleInputChange}
              />
            </label>
          </div>

          <button type="submit">Upload</button>
        </form>
      )}

      {/* Expiry dashboard */}
      <div className={styles.expiryHeader}>
        <h2>Expiring Documents</h2>
        <div className={styles.expiryActions}>
          <select
            className={styles.windowSelect}
            value={expWindow}
            onChange={(e) => setExpWindow(Number(e.target.value))}
          >
            {EXP_WINDOWS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
          <button className={styles.sweepBtn} onClick={handleSweep}>
            ✉️ Run reminder sweep
          </button>
        </div>
      </div>

      {expiryStats && (
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${expiryStats.expired ? styles.danger : ""}`}>
              {expiryStats.expired}
            </span>
            <span className={styles.statLabel}>Expired</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${expiryStats.expiringSoon ? styles.warn : ""}`}>
              {expiryStats.expiringSoon}
            </span>
            <span className={styles.statLabel}>Expiring Soon</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{expiryStats.ok}</span>
            <span className={styles.statLabel}>Valid</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{expiryStats.tracked}</span>
            <span className={styles.statLabel}>Tracked</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{expiryStats.noExpiry}</span>
            <span className={styles.statLabel}>No Expiry Set</span>
          </div>
        </div>
      )}

      {expiring.length === 0 ? (
        <p className={styles.muted}>No documents expiring in this window.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Notify</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expiring.map((d) => {
              const badge = expiryBadge(d.daysUntilExpiry);
              return (
                <tr key={d._id}>
                  <td>{d.documentName}</td>
                  <td>{d.documentType}</td>
                  <td>{new Date(d.expiryDate).toLocaleDateString()}</td>
                  <td>
                    {badge && <span className={`${styles.badge} ${badge.cls}`}>{badge.text}</span>}
                  </td>
                  <td>{d.notifyEmail || <span className={styles.muted}>default</span>}</td>
                  <td>
                    <button
                      className={styles.reminderBtn}
                      disabled={sendingReminderId === d._id}
                      onClick={() => handleSendReminder(d._id)}
                    >
                      {sendingReminderId === d._id
                        ? "Sending..."
                        : d.reminderSent
                        ? "Resend"
                        : "Send reminder"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* All documents */}
      <h2 className={styles.allHeading}>All Documents</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Visibility</th>
              <th>Uploaded By</th>
              <th>Expiry</th>
              <th>Downloads</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const days = doc.expiryDate
                ? Math.round(
                    (new Date(new Date(doc.expiryDate).setHours(0, 0, 0, 0)) -
                      new Date(new Date().setHours(0, 0, 0, 0))) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;
              const badge = expiryBadge(days);
              return (
                <tr key={doc._id}>
                  <td>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      {doc.documentName}
                    </a>
                  </td>
                  <td>{doc.documentType}</td>
                  <td>{doc.visibility}</td>
                  <td>{doc.uploadedBy}</td>
                  <td>
                    {doc.expiryDate ? (
                      <span className={`${styles.badge} ${badge.cls}`}>
                        {new Date(doc.expiryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td>{doc.downloadCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Documents;
