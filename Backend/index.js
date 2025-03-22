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

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.json());

app.use("/api/resume/:foldername/:filename", (req, res) => {
  const filename = req.params.filename;
  const foldername = req.params.foldername;
  const filepath = path.join(__dirname, `/${foldername}`, filename);
  res.sendFile(filepath);
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Create the uploads directory
}

app.use("/api/auth", authRoutes);
app.use("/api", candidateRoutes);
app.use("/api", employeeRoutes);
app.use("/api", leaveRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
