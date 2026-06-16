const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  skillName: {
    type: String,
    required: true,
  },
  proficiencyLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
    required: true,
  },
  yearsOfExperience: {
    type: Number,
    default: 0,
  },
  certifications: [
    {
      certificationName: String,
      issuingOrganization: String,
      issueDate: Date,
      expiryDate: Date,
      certificateUrl: String,
    },
  ],
  trainings: [
    {
      trainingName: String,
      provider: String,
      completionDate: Date,
      certificateUrl: String,
      duration: String,
    },
  ],
  endorsements: {
    type: Number,
    default: 0,
  },
  addedDate: {
    type: Date,
    default: Date.now,
  },
});

SkillSchema.index({ employeeId: 1 });
const Skill = mongoose.model("Skill", SkillSchema);
module.exports = Skill;
