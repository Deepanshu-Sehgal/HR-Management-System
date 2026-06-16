

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






const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


router.post("/employeeleavefilterbystatus", getLeaveData);

router.post(
  "/employeeleave",
  upload.fields([{ name: "resume" }, { name: "image" }]),
  createLeave
);
router.put("/employeeleave/:id", updateLeave);
router.post("/employeeleavefilter", filterbydate);

module.exports = router;
