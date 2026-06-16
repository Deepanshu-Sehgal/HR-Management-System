const path = require("path");
const fs = require("fs");
const Leave = require("../models/Leave");


exports.getLeaveData = async (req, res) => {
  try {
    const body = req.body;
    console.log(body, "status filtered data");
    const leave = await Leave.find(body);
    res.status(200).json(leave);
  } catch (error) {
    console.error("Error fetching leave data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


function reverseDate(date) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}


exports.createLeave = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);
    const { name, department, leavedate1, leavedate2, reason } = req.body;
    let finalleavedate = leavedate1;

    if (finalleavedate != leavedate2) {
      finalleavedate = `${leavedate1} - ${leavedate2}`;
    }

    const resumeFile = req.files["resume"] ? req.files["resume"][0] : null;
    const imageFile = req.files["image"] ? req.files["image"][0] : null;

    if (!resumeFile) {
      return res.status(400).json({ message: "Resume is required" });
    }
    if (!imageFile) {
      return res.status(400).json({ message: "Image is required" });
    }

    const resumeFileName = `${Date.now()}-${resumeFile.originalname}`;
    const resumePath = path.join(__dirname, "..", "uploads", resumeFileName);
    const imageFileName = `${Date.now()}-${imageFile.originalname}`;
    const imagePath = path.join(__dirname, "..", "uploads", imageFileName);

    fs.renameSync(resumeFile.path, resumePath);
    fs.renameSync(imageFile.path, imagePath);

    const datee = new Date().toLocaleDateString();
    const newLeave = new Leave({
      name,
      department,
      leavedate: reverseDate(finalleavedate),
      date: datee,
      reason,
      status: "Pending",
      resume: resumeFileName,
      image: imageFileName,
    });

    await newLeave.save();
    res.status(201).json({ message: "Leave saved successfully", resumePath });
  } catch (error) {
    console.error("Error saving leave:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.updateLeave = async (req, res) => {
  const leaveId = req.params.id;
  const body = req.body;
  console.log(req.body, "leave update payload");

  try {
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    await Leave.findByIdAndUpdate(leaveId, body, { new: true });
    res.status(200).json({ message: "Leave request updated successfully" });
  } catch (error) {
    console.error("Error updating leave request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.filterbydate = async (req, res) => {
  try {
    const body = req.body;
    console.log(body, "body of filtered data");
    const leave = await Leave.find(body);
    res.status(200).json(leave);
  } catch (error) {
    console.error("Error fetching leave records:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
