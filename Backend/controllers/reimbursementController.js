const Reimbursement = require("../models/Reimbursement");

exports.createReimbursement = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      department,
      category,
      amount,
      currency,
      description,
      receiptUrl,
    } = req.body;

    if (!employeeId || !employeeName || amount === undefined) {
      return res.status(400).json({ message: "employeeId, employeeName and amount are required" });
    }

    const reimbursement = new Reimbursement({
      employeeId,
      employeeName,
      department,
      category,
      amount,
      currency: currency || "USD",
      description,
      receiptUrl,
    });

    await reimbursement.save();
    res.status(201).json({ message: "Reimbursement request submitted", reimbursement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReimbursements = async (req, res) => {
  try {
    const reimbursements = await Reimbursement.find().sort({ submittedAt: -1 });
    res.status(200).json(reimbursements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReimbursementsByEmployeeId = async (req, res) => {
  try {
    const reimbursements = await Reimbursement.find({ employeeId: req.params.employeeId }).sort({ submittedAt: -1 });
    res.status(200).json(reimbursements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReimbursement = async (req, res) => {
  try {
    const reimbursement = await Reimbursement.findById(req.params.id);
    if (!reimbursement) {
      return res.status(404).json({ message: "Reimbursement request not found" });
    }

    const updates = req.body;
    if (updates.status && ["Approved", "Rejected"].includes(updates.status)) {
      updates.approvedAt = new Date();
    }

    const updatedReimbursement = await Reimbursement.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    res.status(200).json({ message: "Reimbursement request updated", reimbursement: updatedReimbursement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReimbursement = async (req, res) => {
  try {
    const reimbursement = await Reimbursement.findByIdAndDelete(req.params.id);
    if (!reimbursement) {
      return res.status(404).json({ message: "Reimbursement request not found" });
    }
    res.status(200).json({ message: "Reimbursement request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReimbursementSummary = async (req, res) => {
  try {
    const summary = await Reimbursement.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]),
    result = {
      pending: 0,
      approved: 0,
      rejected: 0,
      totalAmount: 0,
    };

    summary.forEach((item) => {
      const key = item._id ? item._id.toLowerCase() : "unknown";
      result[key] = item.count;
      result.totalAmount += item.totalAmount || 0;
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
