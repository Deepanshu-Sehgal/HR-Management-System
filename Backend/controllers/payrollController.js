const Payroll = require("../models/Payroll");

// Create Payroll
exports.createPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      month,
      year,
      baseSalary,
      allowances,
      deductions,
      overtimeHours,
    } = req.body;

    const totalAllowances = Object.values(allowances).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
    const overtimeAmount = overtimeHours * (baseSalary / (30 * 8));
    const grossSalary = baseSalary + totalAllowances + overtimeAmount;
    const netSalary = grossSalary - totalDeductions;

    const newPayroll = new Payroll({
      employeeId,
      employeeName,
      month,
      year,
      baseSalary,
      allowances,
      deductions,
      overtimeHours,
      overtimeAmount,
      totalAllowances,
      totalDeductions,
      grossSalary,
      netSalary,
    });

    await newPayroll.save();
    res.status(201).json({ message: "Payroll created successfully", payroll: newPayroll });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Payrolls
exports.getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find();
    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Payroll by Employee ID
exports.getPayrollByEmployeeId = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employeeId: req.params.employeeId });
    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Payroll by Month and Year
exports.getPayrollByMonthYear = async (req, res) => {
  try {
    const { month, year } = req.params;
    const payrolls = await Payroll.find({ month, year });
    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Payroll
exports.updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json({ message: "Payroll updated successfully", payroll });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Process Payroll
exports.processPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: "Processed", paymentDate: Date.now() },
      { new: true }
    );
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json({ message: "Payroll processed successfully", payroll });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Payroll
exports.deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    res.status(200).json({ message: "Payroll deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Payroll Analytics
exports.getPayrollAnalytics = async (req, res) => {
  try {
    const analytics = await Payroll.aggregate([
      {
        $group: {
          _id: null,
          totalGrossSalary: { $sum: "$grossSalary" },
          totalNetSalary: { $sum: "$netSalary" },
          averageNetSalary: { $avg: "$netSalary" },
          totalDeductions: { $sum: "$totalDeductions" },
          totalAllowances: { $sum: "$totalAllowances" },
        },
      },
    ]);

    res.status(200).json(analytics[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
