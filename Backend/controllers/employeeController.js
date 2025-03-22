const Employees = require("../models/Employee");
const path = require("path"); // Import path module
const fs = require("fs"); // Import fs module

exports.getEmployees = async (req, res) => {
  console.log(req.body);
  const pos = req.body.department;
  let employees;
  try {
    if (pos === "") {
      employees = await Employees.find();
    } else {
      employees = await Employees.find({
        department: pos,
      });
    }
    res.status(200).json(employees); // Return the candidates array
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Controller to delete a candidate by ID
exports.deleteEmployees = async (req, res) => {
  const employeeId = req.params.id;

  try {
    // Find the candidate to delete
    const employee = await Employees.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    // Delete the candidate from the database
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
  console.log(employeeId, "empl name");
  try {
    // Find the candidate to delete
    const employee = await Employees.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    await Employees.findByIdAndUpdate(employeeId, body, { new: true });
    console.log("cjlra");
    res.status(200).json({ message: "Candidate updated successfully" });
  } catch (error) {
    console.error("Error updated candidate:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
