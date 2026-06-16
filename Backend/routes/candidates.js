const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  createCandidate,
  getCandidates,
  deleteCandidate,
  updateCandidate,
} = require("../controllers/candidateController");

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploaded files into uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamped file names
  },
});

const upload = multer({ storage });

// Create a new candidate with resume and image upload
router.post(
  "/candidates",
  upload.fields([{ name: "resume" }, { name: "image" }]),
  createCandidate
);

// Update candidate status by ID
router.put("/candidates/:id", updateCandidate);

// Fetch candidate records with optional filters
router.post("/candidates/fetch", getCandidates);
router.get("/candidates", getCandidates);

// Download a resume file by filename
router.get("/download-resume/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, `../uploads/${filename}`);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error("File not found:", err);
      return res.status(404).send("File not found");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        return res.status(err.status || 500).send("Error downloading file");
      }
    });
  });
});

// Delete a candidate by ID
router.delete("/candidates/:id", deleteCandidate);
module.exports = router;
