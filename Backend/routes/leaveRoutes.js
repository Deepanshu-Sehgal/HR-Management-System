

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../utils/authMiddleware");
const authorize = require("../utils/authorize");
const validate = require("../utils/validate");
const {
  getLeaveData,
  createLeave,
  updateLeave,
  filterbydate,
  getLeaveSummary,
} = require("../controllers/leaveController");
const { leaveSchema, leaveUpdateSchema } = require("../validators/leaveValidators");






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
  "/employeeleavefilterbystatus",
  authMiddleware,
  authorize("admin", "hr"),
  getLeaveData
);

router.post(
  "/employeeleave",
  authMiddleware,
  authorize("admin", "hr", "employee"),
  upload.fields([{ name: "resume" }, { name: "image" }]),
  validate(leaveSchema),
  createLeave
);
router.put(
  "/employeeleave/:id",
  authMiddleware,
  authorize("admin", "hr"),
  validate(leaveUpdateSchema),
  updateLeave
);

router.get(
  "/employeeleave/summary",
  authMiddleware,
  authorize("admin", "hr"),
  getLeaveSummary
);

router.post(
  "/employeeleavefilter",
  authMiddleware,
  authorize("admin", "hr"),
  filterbydate
);

module.exports = router;
