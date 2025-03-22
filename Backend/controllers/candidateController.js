const Candidate = require("../models/Candidate");
const Employee = require("../models/Employee");
const path = require("path");
const fs = require("fs");
exports.createCandidate = async (req, res) => {
  console.log(req.body);
  try {
    const resumeFile = req.files["resume"] ? req.files["resume"][0] : null;
    const imageFile = req.files["image"] ? req.files["image"][0] : null;
    const { candidateName, email, phoneNumber, department, experience } =
      req.body;

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
    console.log(datee, "date");

    const newCandidate = new Candidate({
      candidateName,
      email,
      phoneNumber,
      department,
      experience,
      status: "New",
      date: datee,
      resume: resumeFileName,
      image: imageFileName,
    });
    const newEmployee = new Employee({
      employeeName: candidateName,
      email,
      phoneNumber,
      position: "Full Time",
      department,
      experience,
      status: "Absent",
      date: datee,
      task: "",
      image: imageFileName,
    });

    await newCandidate.save();
    await newEmployee.save();
    res
      .status(201)
      .json({ message: "Candidate saved successfully", resumePath, imagePath });
  } catch (error) {
    console.error("Error saving candidate:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getCandidates = async (req, res) => {
  const status = req.body.status;
  const pos = req.body.department;
  console.log(req.body);
  let candidates = null;
  try {
    if (status === "" && pos === "") {
      candidates = await Candidate.find();
    } else if (status != "") {
      candidates = await Candidate.find({
        status: status,
      });
    } else if (pos != "") {
      candidates = await Candidate.find({
        department: pos,
      });
    } else {
      candidates = await Candidate.find({
        status: status,
        department: pos,
      });
    }

    res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteCandidate = async (req, res) => {
  const candidateId = req.params.id;

  try {
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const resumePath = path.join(__dirname, `../uploads/${candidate.resume}`);
    fs.unlinkSync(resumePath);

    await Candidate.findByIdAndDelete(candidateId);

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateCandidate = async (req, res) => {
  const candidateId = req.params.id;
  console.log("horaaa");
  console.log(req.body, "Body of the user");
  const updatedStatus = req.body.status;
  console.log(updatedStatus, "Body of the user");
  try {
    const candidate = await Candidate.findById(candidateId);
    console.log(candidateId, "candidate");
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { status: updatedStatus },
      { new: true }
    );

    console.log(updatedCandidate, "updated candidate");
    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
