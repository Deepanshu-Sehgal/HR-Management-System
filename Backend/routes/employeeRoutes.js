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

// Configure multer storage; ready for future file uploads if needed
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Update employee record by ID
router.put("/employee/:id", updateEmployees);

// Retrieve employees with optional department filtering
router.get("/employee", getEmployees);
router.post("/employee/filter", getEmployees);

// Delete an employee by ID
router.delete("/employee/:id", deleteEmployees);
module.exports = router;
