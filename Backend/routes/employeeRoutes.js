

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


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


router.put("/employee/:id", updateEmployees);


router.get("/employee", getEmployees);
router.post("/employee/filter", getEmployees);


router.delete("/employee/:id", deleteEmployees);
module.exports = router;
