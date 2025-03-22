//by Paras

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getLeaveData,
  createLeave,
  updateLeave,
  filterbydate,
} = require("../controllers/leaveController");

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

// Route to get all candidates
router.post("/employeeleavefilterbystatus", getLeaveData);

router.post(
  "/employeeleave",
  upload.fields([{ name: "resume" }, { name: "image" }]),
  createLeave
);
router.put("/employeeleave/:id", updateLeave);
router.post("/employeeleavefilter", filterbydate);

module.exports = router;
