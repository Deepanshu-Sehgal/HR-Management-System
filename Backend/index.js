const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidates");
const employeeRoutes = require("./routes/employeeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Leave = require("./models/Leave");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB before starting the application
connectDB();

const app = express();

// Enable CORS for frontend requests and allow JSON request bodies
app.use(cors());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.json());

// Serve resume files from a dynamic folder path under /api/resume/
app.use("/api/resume/:foldername/:filename", (req, res) => {
  const filename = req.params.filename;
  const foldername = req.params.foldername;
  const filepath = path.join(__dirname, `/${foldername}`, filename);
  res.sendFile(filepath);
});

// Ensure the uploads directory exists for storing uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Mount route groups for authentication, candidates, employees, and leave management
app.use("/api/auth", authRoutes);
app.use("/api", candidateRoutes);
app.use("/api", employeeRoutes);
app.use("/api", leaveRoutes);

// Listen on configured port or fallback to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
