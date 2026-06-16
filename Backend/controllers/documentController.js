const Document = require("../models/Document");

// Create Document
exports.createDocument = async (req, res) => {
  try {
    const {
      documentName,
      documentType,
      description,
      fileUrl,
      uploadedBy,
      department,
      visibility,
      accessibleTo,
      tags,
      expiryDate,
    } = req.body;

    const newDocument = new Document({
      documentName,
      documentType,
      description,
      fileUrl,
      uploadedBy,
      department,
      visibility,
      accessibleTo,
      tags,
      expiryDate,
    });

    await newDocument.save();
    res.status(201).json({ message: "Document uploaded successfully", document: newDocument });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Documents
exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ isActive: true }).sort({ uploadDate: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Documents by Type
exports.getDocumentsByType = async (req, res) => {
  try {
    const documents = await Document.find({
      documentType: req.params.type,
      isActive: true,
    }).sort({ uploadDate: -1 });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search Documents
exports.searchDocuments = async (req, res) => {
  try {
    const { query } = req.query;
    const documents = await Document.find({
      $or: [
        { documentName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
      isActive: true,
    });
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Document
exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.status(200).json({ message: "Document updated successfully", document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deactivate Document
exports.deactivateDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.status(200).json({ message: "Document deactivated successfully", document });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) return res.status(404).json({ message: "Document not found" });
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
