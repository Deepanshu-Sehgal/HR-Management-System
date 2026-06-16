const mongoose = require("mongoose");

// Candidate schema defines the structure for candidate documents
const candidateSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true, // Ensure unique email addresses
    lowercase: true, // Normalize to lowercase before saving
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  experience: {
    type: String,
    required: true,
    trim: true,
  },
  resume: {
    type: String,
    required: true, // Resume file name stored in uploads directory
  },
  image: {
    type: String,
    required: true, // Image file name stored in uploads directory
  },
  status: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

// Index candidate name for faster searches if needed
candidateSchema.index({ candidateName: 1 });

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
