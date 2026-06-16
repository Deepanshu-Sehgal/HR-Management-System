import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocuments, uploadDocument } from "../../redux/Slices/DocumentSlice";
import styles from "./Documents.module.css";

function Documents() {
  const dispatch = useDispatch();
  const { documents, loading } = useSelector((state) => state.document);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    documentName: "",
    documentType: "Policy",
    description: "",
    fileUrl: "",
    uploadedBy: "",
    visibility: "Internal",
    tags: "",
  });

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      tags: formData.tags.split(",").map((tag) => tag.trim()),
    };
    dispatch(uploadDocument(data));
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
    });
    setShowForm(false);
  };

  return (
    <div className={styles.container}>
      <h1>Document Management</h1>
      <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
        {showForm ? "Cancel" : "Upload Document"}
      </button>

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
          <button type="submit">Upload</button>
        </form>
      )}

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
              <th>Downloads</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc._id}>
                <td>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    {doc.documentName}
                  </a>
                </td>
                <td>{doc.documentType}</td>
                <td>{doc.visibility}</td>
                <td>{doc.uploadedBy}</td>
                <td>{doc.downloadCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Documents;
