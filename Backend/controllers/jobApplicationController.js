const JobApplication = require("../models/JobApplication");

// Create Job Application
exports.createJobApplication = async (req, res) => {
  try {
    const {
      jobOpeningId,
      jobTitle,
      applicantName,
      email,
      phoneNumber,
      resume,
      coverLetter,
      experience,
      qualifications,
    } = req.body;

    const newApplication = new JobApplication({
      jobOpeningId,
      jobTitle,
      applicantName,
      email,
      phoneNumber,
      resume,
      coverLetter,
      experience,
      qualifications,
    });

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully", application: newApplication });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Job Applications
exports.getAllJobApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Applications by Job Opening ID
exports.getApplicationsByJobOpeningId = async (req, res) => {
  try {
    const applications = await JobApplication.find({ jobOpeningId: req.params.jobOpeningId });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Application Status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, rating, interviewDate, interviewFeedback } = req.body;
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status, rating, interviewDate, interviewFeedback },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Application updated successfully", application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send Job Offer
exports.sendJobOffer = async (req, res) => {
  try {
    const { offerStatus } = req.body;
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status: "Offered", offerStatus },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Offer sent successfully", application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject Application
exports.rejectApplication = async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Application rejected", application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Application
exports.deleteJobApplication = async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Application Analytics
exports.getApplicationAnalytics = async (req, res) => {
  try {
    const analytics = await JobApplication.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
