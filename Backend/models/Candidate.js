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
    unique: true, 
    lowercase: true, 
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
    required: true, 
  },
  image: {
    type: String,
    required: true, 
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


candidateSchema.index({ candidateName: 1 });

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
