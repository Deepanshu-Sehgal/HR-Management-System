const PerformanceReview = require("../models/PerformanceReview");

// Create Performance Review
exports.createPerformanceReview = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      reviewerName,
      reviewPeriod,
      performanceRating,
      goals,
      achievements,
      areasForImprovement,
      feedback,
      salary_increment,
      promotion,
    } = req.body;

    const newReview = new PerformanceReview({
      employeeId,
      employeeName,
      reviewerName,
      reviewPeriod,
      performanceRating,
      goals,
      achievements,
      areasForImprovement,
      feedback,
      salary_increment,
      promotion,
    });

    await newReview.save();
    res.status(201).json({ message: "Performance Review created successfully", review: newReview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Performance Reviews
exports.getAllPerformanceReviews = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Reviews by Employee ID
exports.getReviewsByEmployeeId = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find({ employeeId: req.params.employeeId });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Performance Review
exports.updatePerformanceReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json({ message: "Review updated successfully", review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Performance Review
exports.deletePerformanceReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Review Analytics
exports.getReviewAnalytics = async (req, res) => {
  try {
    const averageRating = await PerformanceReview.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$performanceRating" },
          totalReviews: { $sum: 1 },
          promotionCount: {
            $sum: { $cond: [{ $eq: ["$promotion", "Approved"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json(averageRating[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
