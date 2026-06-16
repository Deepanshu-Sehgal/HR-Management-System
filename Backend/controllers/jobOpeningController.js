const JobOpening = require("../models/JobOpening");

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
