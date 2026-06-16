import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayrolls, createPayroll, processPayroll } from "../../redux/Slices/PayrollSlice";
import styles from "./Payroll.module.css";

function Payroll() {
  const dispatch = useDispatch();
  const { payrolls, loading } = useSelector((state) => state.payroll);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    month: "",
    year: new Date().getFullYear(),
    baseSalary: 0,
    allowances: { hra: 0, da: 0, medical: 0, other: 0 },
    deductions: { incomeTax: 0, providentFund: 0, insurance: 0, other: 0 },
    overtimeHours: 0,
  });

  useEffect(() => {
    dispatch(fetchPayrolls());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAllowanceChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      allowances: { ...formData.allowances, [name]: parseFloat(value) },
    });
  };

  const handleDeductionChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      deductions: { ...formData.deductions, [name]: parseFloat(value) },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createPayroll(formData));
    setFormData({
      employeeId: "",
      employeeName: "",
      month: "",
      year: new Date().getFullYear(),
      baseSalary: 0,
      allowances: { hra: 0, da: 0, medical: 0, other: 0 },
      deductions: { incomeTax: 0, providentFund: 0, insurance: 0, other: 0 },
      overtimeHours: 0,
    });
    setShowForm(false);
  };

  const handleProcess = (id) => {
    if (window.confirm("Process this payroll?")) {
      dispatch(processPayroll(id));
    }
  };

  return (
    <div className={styles.container}>
      <h1>Payroll Management</h1>
      <button onClick={() => setShowForm(!showForm)} className={styles.addBtn}>
        {showForm ? "Cancel" : "Generate Payroll"}
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
            name="month"
            placeholder="Month (e.g., January)"
            value={formData.month}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="year"
            placeholder="Year"
            value={formData.year}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="baseSalary"
            placeholder="Base Salary"
            value={formData.baseSalary}
            onChange={handleInputChange}
            required
          />

          <h3>Allowances</h3>
          <input
            type="number"
            name="hra"
            placeholder="HRA"
            value={formData.allowances.hra}
            onChange={handleAllowanceChange}
          />
          <input
            type="number"
            name="da"
            placeholder="DA"
            value={formData.allowances.da}
            onChange={handleAllowanceChange}
          />

          <h3>Deductions</h3>
          <input
            type="number"
            name="incomeTax"
            placeholder="Income Tax"
            value={formData.deductions.incomeTax}
            onChange={handleDeductionChange}
          />
          <input
            type="number"
            name="providentFund"
            placeholder="Provident Fund"
            value={formData.deductions.providentFund}
            onChange={handleDeductionChange}
          />

          <button type="submit">Generate Payroll</button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Month/Year</th>
              <th>Gross Salary</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((payroll) => (
              <tr key={payroll._id}>
                <td>{payroll.employeeName}</td>
                <td>{`${payroll.month} ${payroll.year}`}</td>
                <td>${payroll.grossSalary}</td>
                <td>${payroll.netSalary}</td>
                <td>{payroll.paymentStatus}</td>
                <td>
                  <button
                    onClick={() => handleProcess(payroll._id)}
                    className={styles.processBtn}
                    disabled={payroll.paymentStatus !== "Pending"}
                  >
                    Process
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

export default Payroll;
