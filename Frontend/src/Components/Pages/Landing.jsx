import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/apiClient";
import styles from "./Landing.module.css";

const Landing = () => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      try {
        const response = await apiClient.get("/pages/slug/landing");
        setPage(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load landing page content.");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  return (
    <div className={styles.landingPage}>
      <section className={styles.heroSection}>
        {loading ? (
          <p>Loading landing page...</p>
        ) : error ? (
          <div>
            <h1>Welcome to HR Management</h1>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <h1>{page?.title || "Welcome to HR Management"}</h1>
            <div className={styles.content}>
              <p>{page?.content || "Manage employees, attendance, payroll and HR policies from one platform."}</p>
            </div>
          </>
        )}
      </section>

      <section className={styles.linksSection}>
        <h2>Learn more</h2>
        <div className={styles.linkCards}>
          <Link to="/legal/terms" className={styles.card}>
            Terms of Service
          </Link>
          <Link to="/legal/privacy" className={styles.card}>
            Privacy Policy
          </Link>
          <Link to="/legal/about" className={styles.card}>
            About Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
