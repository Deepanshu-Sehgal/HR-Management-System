const Employees = require("../models/Employee");


exports.getEmployees = async (req, res) => {
  console.log(req.body);
  const pos = req.body.department;
  let employees;

  try {
    if (pos === "") {
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
