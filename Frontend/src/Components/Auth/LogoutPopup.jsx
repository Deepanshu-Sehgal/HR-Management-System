import React from 'react';
import styles from './LogoutPopup.module.css';
import { useNavigate } from 'react-router-dom';

const LogoutPopup = ({ isOpen, onClose, onConfirm }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform logout actions here if needed (e.g., clearing tokens)
    onConfirm();  // Call the onConfirm prop to handle logout confirmation
    navigate('/login'); // Navigate to the login page
  };

  if (!isOpen) return null; // Don't render the popup if not open

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        <div className={styles.popupHeader}>
          <h2>Log Out</h2>
        </div>
        <div className={styles.popupBody}>
          <p>Are you sure you want to log out?</p>
        </div>
        <div className={styles.popupFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPopup;
