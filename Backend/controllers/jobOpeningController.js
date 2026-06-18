const JobOpening = require("../models/JobOpening");
const Skill = require("../models/Skill");
const Employee = require("../models/Employee");

const proficiencyWeights = {
  Beginner: 0.3,
  Intermediate: 0.6,
  Advanced: 0.85,
  Expert: 1.0,
};

function normalizeSkill(name) {
  return String(name || '').trim().toLowerCase();
}

function getProficiencyWeight(level) {
  return proficiencyWeights[level] || 0.3;
}

// Create Job Opening
exports.createJobOpening = async (req, res) => {
  try {
    const {
      jobTitle,
      department,
      description,
      responsibilities,
      qualifications,
      requiredSkills,
      salaryRange,
      jobType,
      location,
      experience,
      numberOfPositions,
    } = req.body;

    const newJobOpening = new JobOpening({
      jobTitle,
      department,
      description,
      responsibilities,
      qualifications,
      requiredSkills,
      salaryRange,
      jobType,
      location,
      experience,
      numberOfPositions,
    });

    await newJobOpening.save();
    res.status(201).json({ message: "Job Opening created successfully", jobOpening: newJobOpening });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Job Openings
exports.getAllJobOpenings = async (req, res) => {
  try {
    const jobOpenings = await JobOpening.find();
    res.status(200).json(jobOpenings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Job Opening by ID
exports.getJobOpeningById = async (req, res) => {
  try {
    const jobOpening = await JobOpening.findById(req.params.id);
    if (!jobOpening) return res.status(404).json({ message: "Job Opening not found" });
    res.status(200).json(jobOpening);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Active Job Openings
exports.getActiveJobOpenings = async (req, res) => {
  try {
    const jobOpenings = await JobOpening.find({ status: "Open" });
    res.status(200).json(jobOpenings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Match employees to a job opening based on required skills and endorsements
exports.matchEmployees = async (req, res) => {
  try {
    const jobOpening = await JobOpening.findById(req.params.id);
    if (!jobOpening) {
      return res.status(404).json({ message: "Job Opening not found" });
    }

    const requiredSkills = (jobOpening.requiredSkills || []).map(normalizeSkill).filter(Boolean);
    if (!requiredSkills.length) {
      return res.status(400).json({ message: "This job opening has no required skills configured." });
    }

    const skills = await Skill.find({ skillName: { $in: requiredSkills } });
    if (!skills.length) {
      return res.status(200).json({
        jobOpening,
        matchedEmployees: [],
        message: "No employees have matching skills yet.",
      });
    }

    const employeeMap = new Map();

    skills.forEach((skill) => {
      const employeeId = skill.employeeId;
      const skillKey = normalizeSkill(skill.skillName);
      const weight = getProficiencyWeight(skill.proficiencyLevel);
      const current = employeeMap.get(employeeId) || {
        employeeId,
        employeeName: skill.employeeName,
        skills: {},
        totalEndorsements: 0,
      };

      const existingWeight = current.skills[skillKey]?.weight || 0;
      if (weight > existingWeight) {
        current.skills[skillKey] = {
          skillName: skill.skillName,
          proficiencyLevel: skill.proficiencyLevel,
          weight,
        };
      }

      current.totalEndorsements = Math.max(current.totalEndorsements, skill.endorsements || 0);
      employeeMap.set(employeeId, current);
    });

    const employeeIds = Array.from(employeeMap.keys());
    const employees = await Employee.find({ _id: { $in: employeeIds } });
    const employeeDetails = employees.reduce((acc, employee) => {
      acc[employee._id.toString()] = employee;
      return acc;
    }, {});

    const matchedEmployees = Array.from(employeeMap.values())
      .map((employeeInfo) => {
        const employee = employeeDetails[employeeInfo.employeeId];
        const matchedSkillNames = Object.keys(employeeInfo.skills);
        const scoreSum = requiredSkills.reduce((score, skillKey) => {
          const skill = employeeInfo.skills[skillKey];
          return score + (skill ? skill.weight : 0);
        }, 0);

        const baseScore = (scoreSum / requiredSkills.length) * 100;
        const endorsementBonus = Math.min(15, (employeeInfo.totalEndorsements || 0) * 0.75);
        const score = Math.round(Math.min(100, baseScore + endorsementBonus));

        return {
          employeeId: employeeInfo.employeeId,
          employeeName: employeeInfo.employeeName,
          department: employee?.department || jobOpening.department,
          position: employee?.position || "Unknown",
          status: employee?.status || "Unknown",
          matchedSkills: matchedSkillNames.map((skillKey) => employeeInfo.skills[skillKey]),
          score,
          matchPercentage: score,
          missingSkills: requiredSkills.filter((skillKey) => !employeeInfo.skills[skillKey]),
        };
      })
      .filter((candidate) => candidate.matchedSkills.length > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.status(200).json({
      jobOpening,
      matchedEmployees,
      requiredSkills: jobOpening.requiredSkills,
      matchCount: matchedEmployees.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Job Opening
exports.updateJobOpening = async (req, res) => {
  try {
    const jobOpening = await JobOpening.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!jobOpening) return res.status(404).json({ message: "Job Opening not found" });
    res.status(200).json({ message: "Job Opening updated successfully", jobOpening });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Close Job Opening
exports.closeJobOpening = async (req, res) => {
  try {
    const jobOpening = await JobOpening.findByIdAndUpdate(
      req.params.id,
      { status: "Closed" },
      { new: true }
    );
    if (!jobOpening) return res.status(404).json({ message: "Job Opening not found" });
    res.status(200).json({ message: "Job Opening closed successfully", jobOpening });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Job Opening
exports.deleteJobOpening = async (req, res) => {
  try {
    const jobOpening = await JobOpening.findByIdAndDelete(req.params.id);
    if (!jobOpening) return res.status(404).json({ message: "Job Opening not found" });
    res.status(200).json({ message: "Job Opening deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
