

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const validate = require("../utils/validate");
const {
  createEmployee,
  updateEmployees,
  getEmployees,
  deleteEmployees,
  addAttendanceRecord,
} = require("../controllers/employeeController");
const { createEmployeeSchema, updateEmployeeSchema } = require("../validators/employeeValidators");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


router.post(
  "/employee",
  authMiddleware,
  authorize("admin", "hr"),
  upload.single("image"),
  validate(createEmployeeSchema),
  createEmployee
);
router.put(
  "/employee/:id",
  authMiddleware,
  authorize("admin", "hr"),
  validate(updateEmployeeSchema),
  updateEmployees
);
router.post(
  "/employee/:id/attendance",
  authMiddleware,
  authorize("admin", "hr", "employee"),
  addAttendanceRecord
);

router.get("/employee", authMiddleware, authorize("admin", "hr"), getEmployees);
router.post("/employee/filter", authMiddleware, authorize("admin", "hr"), getEmployees);

router.delete("/employee/:id", authMiddleware, authorize("admin", "hr"), deleteEmployees);
module.exports = router;
