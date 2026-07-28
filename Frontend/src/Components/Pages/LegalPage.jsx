import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import styles from "./LegalPage.module.css";

const LegalPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await apiClient.get(`/pages/slug/${slug}`);
        setPage(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Page not found.");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  return (
    <div className={styles.legalPage}>
      {loading ? (
        <p>Loading content...</p>
      ) : error ? (
        <div className={styles.notice}>{error}</div>
      ) : (
        <>
          <h1>{page.title}</h1>
          <div className={styles.content}>
            <p>{page.content}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default LegalPage;
