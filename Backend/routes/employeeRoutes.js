//by Paras

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  updateEmployees,
  getEmployees,
  deleteEmployees,
} = require("../controllers/employeeController");

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

router.put("/employee/:id", updateEmployees);
// Route to get all candidates
router.get("/employee", getEmployees);
//dnld
router.post("/employee/filter", getEmployees);
// Route to delete a candidate by ID
router.delete("/employee/:id", deleteEmployees); // Add delete route
module.exports = router;
