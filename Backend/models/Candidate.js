const mongoose = require("mongoose");

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
    lowercase: true, // Normalize to lowercase
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Simple email validation regex
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
    required: true, // Ensure a resume is provided
  },
  image: {
    type: String,
    required: true, // Ensure a resume is provided
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

// You can also add an index if you expect to search by candidateName often
candidateSchema.index({ candidateName: 1 });

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
