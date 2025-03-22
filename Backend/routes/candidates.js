const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  createCandidate,
  getCandidates,
  deleteCandidate,
  updateCandidate, // Import the function to get candidates
} = require("../controllers/candidateController");

// Set up multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set the folder to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  },
});

const upload = multer({ storage });

// Route to create a new candidate with resume upload
router.post(
  "/candidates",
  upload.fields([{ name: "resume" }, { name: "image" }]),
  createCandidate
);
router.put("/candidates/:id", updateCandidate);
// Route to get all candidates
router.post("/candidates/fetch", getCandidates); //by Paras

router.get("/candidates", getCandidates);
//dnld

router.get("/download-resume/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log("filename", filename);
  const filePath = path.join(__dirname, `../uploads/${filename}`);
  console.log("Download route hit");
  console.log("Attempting to download:", filePath); // Log the file path

  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error("File not found:", err);
      return res.status(404).send("File not found");
    }
    console.log(`File size: ${stats.size} bytes`);
    res.setHeader("Content-Type", "application/pdf"); // Set the correct content type
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        return res.status(err.status || 500).send("Error downloading file");
      }
      console.log("File downloaded successfully");
    });
  });
});

// Route to delete a candidate by ID
router.delete("/candidates/:id", deleteCandidate); // Add delete route
module.exports = router;
