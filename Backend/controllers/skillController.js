const Skill = require("../models/Skill");

// Add Skill to Employee
exports.addSkill = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      skillName,
      proficiencyLevel,
      yearsOfExperience,
      certifications,
    } = req.body;

    const newSkill = new Skill({
      employeeId,
      employeeName,
      skillName,
      proficiencyLevel,
      yearsOfExperience,
      certifications,
    });

    await newSkill.save();
    res.status(201).json({ message: "Skill added successfully", skill: newSkill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Skills
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Skills by Employee ID
exports.getSkillsByEmployeeId = async (req, res) => {
  try {
    const skills = await Skill.find({ employeeId: req.params.employeeId });
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Skill
exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.status(200).json({ message: "Skill updated successfully", skill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Certification to Skill
exports.addCertification = async (req, res) => {
  try {
    const { certification } = req.body;
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $push: { certifications: certification } },
      { new: true }
    );
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.status(200).json({ message: "Certification added successfully", skill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Training to Skill
exports.addTraining = async (req, res) => {
  try {
    const { training } = req.body;
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $push: { trainings: training } },
      { new: true }
    );
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.status(200).json({ message: "Training added successfully", skill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Skill
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endorse Skill
exports.endorseSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $inc: { endorsements: 1 } },
      { new: true }
    );
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.status(200).json({ message: "Skill endorsed successfully", skill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
