const Policy = require("../models/Policy");
const PolicyAcknowledgement = require("../models/PolicyAcknowledgement");

exports.createPolicy = async (req, res) => {
  try {
    const { title, content, category, version, effectiveDate, attachments, createdBy } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Policy title and content are required" });
    }

    const policy = new Policy({
      title,
      content,
      category,
      version,
      effectiveDate,
      attachments,
      createdBy: createdBy || req.user?.email || "",
    });

    await policy.save();
    res.status(201).json({ message: "Policy created successfully", policy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find({ isActive: true }).sort({ effectiveDate: -1 });
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.status(200).json(policy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.status(200).json({ message: "Policy updated successfully", policy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deactivatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    res.status(200).json({ message: "Policy deactivated successfully", policy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acknowledgePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const { employeeId, employeeName, comments } = req.body;
    if (!employeeId || !employeeName) {
      return res.status(400).json({ message: "employeeId and employeeName are required" });
    }

    const [acknowledgement] = await PolicyAcknowledgement.find({ policyId: policy._id, employeeId });
    if (acknowledgement) {
      return res.status(200).json({ message: "Policy already acknowledged", acknowledgement });
    }

    const newAck = new PolicyAcknowledgement({
      policyId: policy._id,
      employeeId,
      employeeName,
      comments,
    });

    await newAck.save();
    res.status(201).json({ message: "Policy acknowledged", acknowledgement: newAck });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPolicyAcknowledgements = async (req, res) => {
  try {
    const acknowledgements = await PolicyAcknowledgement.find({ policyId: req.params.id }).sort({ acknowledgedAt: -1 });
    res.status(200).json(acknowledgements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeAcknowledgements = async (req, res) => {
  try {
    const acknowledgements = await PolicyAcknowledgement.find({ employeeId: req.params.employeeId }).populate("policyId", "title category effectiveDate");
    res.status(200).json(acknowledgements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
