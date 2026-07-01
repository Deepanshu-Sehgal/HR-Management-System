const path = require("path");
const fs = require("fs");
const Employees = require("../models/Employee");
const Candidate = require("../models/Candidate");
const Leave = require("../models/Leave");

const generateUniqueId = (prefix) => {
  return `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
};

exports.getEmployees = async (req, res) => {
  console.log(req.body);
  const pos = req.body?.department;
  let employees;

  try {
    if (!pos) {
      employees = await Employees.find();
    } else {
      employees = await Employees.find({ department: pos });
    }

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const {
      employeeName,
      email,
      phoneNumber,
      department,
      position,
      experience,
      date,
    } = req.body;

    const imageFile = req.file;
    if (!imageFile) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    const imageFileName = `${Date.now()}-${imageFile.originalname}`;
    const imagePath = path.join(__dirname, "..", "uploads", imageFileName);
    fs.renameSync(imageFile.path, imagePath);

    const employeeId = req.body.employeeId || generateUniqueId("EMP");

    const newEmployee = new Employees({
      employeeId,
      employeeName,
      email,
      phoneNumber,
      department,
      position,
      experience,
      date,
      status: "Active",
      image: imageFileName,
      attendanceRecords: [],
    });

    await newEmployee.save();
    res.status(201).json({ message: "Employee onboarded successfully" });
  } catch (error) {
    console.error("Error onboarding employee:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addAttendanceRecord = async (req, res) => {
  const employeeId = req.params.id;

  try {
    const employee = await Employees.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const attendanceRecords = employee.attendanceRecords || [];
    const todayRecord = attendanceRecords.find((record) => record.date === today);

    if (!todayRecord) {
      attendanceRecords.push({
        date: today,
        checkIn: now,
        checkOut: "",
        status: "Present",
      });
      employee.status = "Present";
    } else if (todayRecord.checkIn && !todayRecord.checkOut) {
      todayRecord.checkOut = now;
      todayRecord.status = "Completed";
      employee.status = "Completed";
    } else {
      attendanceRecords.push({
        date: today,
        checkIn: now,
        checkOut: "",
        status: "Present",
      });
      employee.status = "Present";
    }

    employee.attendanceRecords = attendanceRecords;
    await employee.save();

    res.status(200).json({
      message: "Attendance updated successfully",
      attendanceRecords: employee.attendanceRecords,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.deleteEmployees = async (req, res) => {
  const employeeId = req.params.id;

  try {
    const employee = await Employees.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await Employees.findByIdAndDelete(employeeId);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.updateEmployees = async (req, res) => {
  const employeeId = req.params.id;
  const body = req.body;
  console.log(employeeId, "employee id");

  try {
    const employee = await Employees.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await Employees.findByIdAndUpdate(employeeId, body, { new: true });
    res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
