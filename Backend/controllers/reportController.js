const Report = require("../models/Report");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Payroll = require("../models/Payroll");
const PerformanceReview = require("../models/PerformanceReview");

// Create Report
exports.createReport = async (req, res) => {
  try {
    const {
      reportName,
      reportType,
      description,
      generatedBy,
      startDate,
      endDate,
      filters,
      format,
      isScheduled,
      scheduleFrequency,
    } = req.body;

    let data = {};
    let summary = {};

    // Generate data based on report type
    switch (reportType) {
      case "Employee":
        data = await Employee.find(filters || {});
        summary = { totalRecords: data.length };
        break;

      case "Attendance":
        data = await AttendanceAnalytics.find({
          ...filters,
          createdAt: { $gte: startDate, $lte: endDate },
        });
        summary = {
          totalRecords: data.length,
          metrics: await AttendanceAnalytics.aggregate([
            {
              $group: {
                _id: null,
                avgAttendance: { $avg: "$attendancePercentage" },
              },
            },
          ]),
        };
        break;

      case "Leave":
        data = await Leave.find({
          ...filters,
          date: { $gte: startDate, $lte: endDate },
        });
        summary = { totalRecords: data.length };
        break;

      case "Payroll":
        data = await Payroll.find({
          ...filters,
          createdAt: { $gte: startDate, $lte: endDate },
        });
        summary = await Payroll.aggregate([
          {
            $group: {
              _id: null,
              totalGrossSalary: { $sum: "$grossSalary" },
              totalNetSalary: { $sum: "$netSalary" },
            },
          },
        ]);
        break;

      case "Performance":
        data = await PerformanceReview.find({
          ...filters,
          reviewDate: { $gte: startDate, $lte: endDate },
        });
        summary = {
          totalRecords: data.length,
          metrics: await PerformanceReview.aggregate([
            {
              $group: {
                _id: null,
                avgRating: { $avg: "$performanceRating" },
              },
            },
          ]),
        };
        break;

      default:
        data = [];
    }

    const newReport = new Report({
      reportName,
      reportType,
      description,
      generatedBy,
      startDate,
      endDate,
      filters,
      data,
      summary,
      format,
      isScheduled,
      scheduleFrequency,
      nextGenerationDate: isScheduled ? calculateNextDate(scheduleFrequency) : null,
    });

    await newReport.save();
    res.status(201).json({ message: "Report created successfully", report: newReport });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ generatedDate: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Reports by Type
exports.getReportsByType = async (req, res) => {
  try {
    const reports = await Report.find({ reportType: req.params.type }).sort({
      generatedDate: -1,
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Report
exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json({ message: "Report updated successfully", report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate next generation date
const calculateNextDate = (frequency) => {
  const now = new Date();
  switch (frequency) {
    case "Daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "Weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "Monthly":
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case "Quarterly":
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    case "Yearly":
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    default:
      return null;
  }
};
