const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const { createFileFilter } = require("../utils/fileUpload");
const {
  createCandidate,
  getCandidates,
  deleteCandidate,
  updateCandidate,
} = require("../controllers/candidateController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage, fileFilter: createFileFilter(["resume", "image"]) });


router.post(
  "/candidates",
  upload.fields([{ name: "resume" }, { name: "image" }]),
  createCandidate
);


router.put("/candidates/:id", updateCandidate);


router.post("/candidates/fetch", getCandidates);
router.get("/candidates", getCandidates);


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


router.delete("/candidates/:id", deleteCandidate);
module.exports = router;
