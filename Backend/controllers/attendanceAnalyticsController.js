const AttendanceAnalytics = require("../models/AttendanceAnalytics");

// Create Attendance Analytics
exports.createAttendanceAnalytics = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      month,
      year,
      totalWorkingDays,
      presentDays,
      absentDays,
      leaveDays,
      halfDays,
      lateDays,
      overtimeHours,
    } = req.body;

    const attendancePercentage = (presentDays / totalWorkingDays) * 100;

    const newAnalytics = new AttendanceAnalytics({
      employeeId,
      employeeName,
      month,
      year,
      totalWorkingDays,
      presentDays,
      absentDays,
      leaveDays,
      halfDays,
      lateDays,
      overtimeHours,
      attendancePercentage,
    });

    await newAnalytics.save();
    res.status(201).json({ message: "Attendance Analytics created successfully", analytics: newAnalytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Attendance Analytics
exports.getAllAttendanceAnalytics = async (req, res) => {
  try {
    const analytics = await AttendanceAnalytics.find();
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Analytics by Employee ID
exports.getAnalyticsByEmployeeId = async (req, res) => {
  try {
    const analytics = await AttendanceAnalytics.find({ employeeId: req.params.employeeId });
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Analytics by Month and Year
exports.getAnalyticsByMonthYear = async (req, res) => {
  try {
    const { month, year } = req.params;
    const analytics = await AttendanceAnalytics.find({ month, year });
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Attendance Analytics
exports.updateAttendanceAnalytics = async (req, res) => {
  try {
    const analytics = await AttendanceAnalytics.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!analytics) return res.status(404).json({ message: "Analytics not found" });
    res.status(200).json({ message: "Analytics updated successfully", analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Attendance Summary
exports.getAttendanceSummary = async (req, res) => {
  try {
    const summary = await AttendanceAnalytics.aggregate([
      {
        $group: {
          _id: null,
          avgAttendance: { $avg: "$attendancePercentage" },
          totalEmployees: { $sum: 1 },
          highAbsenteeism: {
            $sum: { $cond: [{ $lt: ["$attendancePercentage", 75] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json(summary[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Attendance Analytics
exports.deleteAttendanceAnalytics = async (req, res) => {
  try {
    const analytics = await AttendanceAnalytics.findByIdAndDelete(req.params.id);
    if (!analytics) return res.status(404).json({ message: "Analytics not found" });
    res.status(200).json({ message: "Analytics deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
