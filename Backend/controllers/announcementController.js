const Announcement = require("../models/Announcement");

// Create Announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      author,
      department,
      category,
      priority,
      expiryDate,
      attachments,
    } = req.body;

    const newAnnouncement = new Announcement({
      title,
      description,
      author,
      department,
      category,
      priority,
      expiryDate,
      attachments,
    });

    await newAnnouncement.save();
    res.status(201).json({ message: "Announcement created successfully", announcement: newAnnouncement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true }).sort({ publishDate: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Active Announcements
exports.getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ expiryDate: { $gte: new Date() } }, { expiryDate: null }],
    }).sort({ publishDate: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json({ message: "Announcement updated successfully", announcement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deactivate Announcement
exports.deactivateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json({ message: "Announcement deactivated successfully", announcement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
