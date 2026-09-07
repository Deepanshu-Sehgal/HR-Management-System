const Page = require("../models/Page");

const createSlug = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

exports.createPage = async (req, res) => {
  try {
    const { title, content, section, subSection, status, slug, metadata } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const pageSlug = slug ? slug.toLowerCase().trim() : createSlug(title);
    const existing = await Page.findOne({ slug: pageSlug });
    if (existing) {
      return res.status(400).json({ message: "A page with that slug already exists" });
    }

    const page = new Page({
      slug: pageSlug,
      title,
      content,
      section: section || "other",
      subSection: subSection || "other",
      status: status || "published",
      metadata,
    });

    await page.save();
    res.status(201).json({ message: "Page created successfully", page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPages = async (req, res) => {
  try {
    const filters = {};
    if (req.query.section) filters.section = req.query.section;
    if (req.query.status) filters.status = req.query.status;
    const pages = await Page.find(filters).sort({ updatedAt: -1 });
    res.status(200).json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, status: "published" });
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.status(200).json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    if (updateData.slug) {
      updateData.slug = updateData.slug.toLowerCase().trim();
    }

    const page = await Page.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.status(200).json({ message: "Page updated successfully", page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.status(200).json({ message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
