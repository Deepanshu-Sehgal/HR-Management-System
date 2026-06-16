const Department = require("../models/Department");

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const { departmentName, departmentCode, manager, description, budget } = req.body;

    const newDepartment = new Department({
      departmentName,
      departmentCode,
      manager,
      description,
      budget,
    });

    await newDepartment.save();
    res.status(201).json({ message: "Department created successfully", department: newDepartment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Department
exports.updateDepartment = async (req, res) => {
  try {
    const { departmentName, manager, description, budget } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { departmentName, manager, description, budget, updatedAt: Date.now() },
      { new: true }
    );
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.status(200).json({ message: "Department updated successfully", department });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
