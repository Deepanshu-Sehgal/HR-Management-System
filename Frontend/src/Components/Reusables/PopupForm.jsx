import React, { useState, useEffect, useRef } from "react";
import styles from "./PopupForm.module.css";
import { Close, CloudUpload, dateblack, downArrow } from "../../assets";

const PopupForm = ({ isOpen, onClose, title, fields, onSave }) => {
  const [formData, setFormData] = useState(() =>
    fields.reduce((acc, field) => {
      acc[field.name] = field.type === "file" ? null : "";
      return acc;
    }, {})
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selected, setSelected] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const getCurrentDate = () => {
    const today = new Date();
    return today;
  };
  const reverseDate = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    setSelectedDate(getCurrentDate());
  }, []);
  const handleDateChange = (e) => {
    let d = e.target.value;
    setSelectedDate(d);
    setFormData((prevData) => ({
      ...prevData,
      date: reverseDate(d),
    }));
  };

  const openDatePicker = () => {
    dateInputRef.current.showPicker();
  };

  const [optionVal, setOptionVal] = useState("Team Lead");
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    console.log(name, value, type, files, "faltu data");
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const dateInputRef = useRef(null);

  const options = [
    { value: "Team Lead", label: "Option 1" },
    { value: "Intern", label: "Option 2" },
    { value: "Senior Designer", label: "Option 3" },
    { value: "Junior Developer", label: "Option 3" },
    { value: "Senior Developer", label: "Option 3" },
    { value: "Full Time", label: "Option 3" },
  ];
  const validateForm = () => {
    const allFieldsFilled = fields.every((field) => {
      if (field.required) {
        return formData[field.name] !== "" && formData[field.name] !== null;
      }
      return true;
    });
    setIsFormValid(allFieldsFilled);
  };

  useEffect(() => {
    console.log(formData, "form data after image is added");
    validateForm();
  }, [formData]);
  const handleSave = () => {
    console.log(fields);
    const emptyFields = fields.filter(
      (field) => field.required && !formData[field.name]
    );
    if (emptyFields.length > 0) {
      const emptyFieldNames = emptyFields
        .map((field) => field.placeholder || field.name)
        .join(", ");
      alert(`Please fill out the following fields: ${emptyFieldNames}`);
      return;
    }
    onSave(formData);
    onClose();
    setFormData("");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupForm}>
        <div className={styles.formHeader}>
          <h2>{title}</h2>
          <img
            src={Close}
            alt="Close"
            className={styles.closeIcon}
            onClick={onClose}
          />
        </div>
        <div className={styles.formGrid}>
          {fields.map((field, index) => (
            <div key={index} className={styles.inputWrapper}>
              {field.name === "resume" || field.name === "image" ? (
                <div className={styles.inputWithIcon}>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name]?.name || ""}
                    placeholder={field.name}
                    className={styles.inputFieldWithIcon}
                    readOnly
                    required={field.required}
                  />
                  <img
                    src={CloudUpload}
                    alt="Upload"
                    className={styles.uploadIcon}
                    onClick={() =>
                      document
                        .getElementById(`file-upload-${field.name}`)
                        .click()
                    }
                  />
                  <input
                    type="file"
                    id={`file-upload-${field.name}`}
                    style={{ display: "none" }}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: field.name,
                          type: "file",
                          files: e.target.files,
                        },
                      })
                    }
                  />
                </div>
              ) : field.name === "position" ? (
                <div className={styles.inputWithIcon}>
                  <input
                    type={field.type}
                    name={field.name}
                    value={optionVal}
                    onChange={handleChange}
                    placeholder={" "}
                    className={styles.inputField}
                    required={field.required} // Set required attribute
                  />
                  <label>
                    {field.placeholder}
                    {field.required && (
                      <span className={styles.requiredAsterisk}>*</span>
                    )}
                  </label>
                  <img
                    src={downArrow}
                    style={{ width: "15px", height: "15px" }}
                    alt="Upload"
                    className={styles.uploadIcon}
                    onClick={() => setSelected(!selected)}
                  />
                  {selected && (
                    <div className={styles.dropdownOptions}>
                      {" "}
                      {/* Add a class for styling */}
                      {options.map((d, i) => (
                        <div
                          key={i}
                          className={styles.optionItem}
                          onClick={() => {
                            setOptionVal(d.value);
                            setFormData((prevData) => ({
                              ...prevData,
                              position: d.value, // Update formData with selected value
                            }));
                            setSelected(false);
                          }}
                        >
                          {d.value}
                        </div> // Use key and return the div
                      ))}
                    </div>
                  )}
                </div>
              ) : field.name === "date" ? (
                <div className={styles.inputWithIcon}>
                  <input
                    ref={dateInputRef}
                    type="date"
                    name={field.name}
                    value={selectedDate}
                    onChange={handleDateChange}
                    placeholder={" "}
                    className={styles.inputField}
                  />
                  <label>
                    {field.placeholder}
                    {field.required && (
                      <span className={styles.requiredAsterisk}>*</span>
                    )}
                  </label>
                  <img
                    src={dateblack}
                    style={{ width: "15px", height: "15px" }}
                    alt="Upload"
                    className={styles.uploadIcon}
                    onClick={openDatePicker}
                  />
                </div>
              ) : (
                <div className={styles.inputWrapper}>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={" "}
                    className={styles.inputField}
                    required={field.required} // Set required attribute
                  />
                  <label>
                    {field.placeholder}
                    {field.required && (
                      <span className={styles.requiredAsterisk}>*</span>
                    )}
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={styles.popupButton}
            onClick={handleSave}
            disabled={!isFormValid}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupForm;
