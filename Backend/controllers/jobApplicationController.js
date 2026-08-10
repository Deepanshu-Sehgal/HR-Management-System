const JobApplication = require("../models/JobApplication");
const { sendEmail } = require("../utils/email");

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

    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: "Job Application Submitted",
          text: `Hi ${applicantName}, your application for ${jobTitle} has been received.`,
          html: `<p>Hello ${applicantName},</p><p>Your application for <strong>${jobTitle}</strong> has been received successfully and is under review.</p>`,
        });
      } catch (emailError) {
        console.error("Job application email notification failed:", emailError);
      }
    }

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

    if (application.email) {
      try {
        await sendEmail({
          to: application.email,
          subject: "Job Application Status Updated",
          text: `Your application status has changed to ${status}.`,
          html: `<p>Hello ${application.applicantName},</p><p>Your application status for <strong>${application.jobTitle}</strong> is now <strong>${status}</strong>.</p>${interviewDate ? `<p>Interview Date: ${new Date(interviewDate).toLocaleString()}</p>` : ""}`,
        });
      } catch (emailError) {
        console.error("Job application status email failed:", emailError);
      }
    }

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

    if (application.email) {
      try {
        await sendEmail({
          to: application.email,
          subject: "Job Offer Sent",
          text: `An offer has been sent for ${application.jobTitle}.`,
          html: `<p>Hello ${application.applicantName},</p><p>An offer has been sent for <strong>${application.jobTitle}</strong>. Your application status is now <strong>Offered</strong>.</p>`,
        });
      } catch (emailError) {
        console.error("Job offer email notification failed:", emailError);
      }
    }

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

    if (application.email) {
      try {
        await sendEmail({
          to: application.email,
          subject: "Job Application Rejected",
          text: `Your application for ${application.jobTitle} has been rejected.`,
          html: `<p>Hello ${application.applicantName},</p><p>We appreciate your interest, but your application for <strong>${application.jobTitle}</strong> has been rejected.</p>`,
        });
      } catch (emailError) {
        console.error("Job rejection email notification failed:", emailError);
      }
    }

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
