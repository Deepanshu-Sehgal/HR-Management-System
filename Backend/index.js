const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidates");
const employeeRoutes = require("./routes/employeeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const skillRoutes = require("./routes/skillRoutes");
const jobOpeningRoutes = require("./routes/jobOpeningRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const documentRoutes = require("./routes/documentRoutes");
const attendanceAnalyticsRoutes = require("./routes/attendanceAnalyticsRoutes");
const reportRoutes = require("./routes/reportRoutes");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const morgan = require('morgan');
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');
const Leave = require("./models/Leave");


dotenv.config();


connectDB();

const app = express();


app.use(cors());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.json());

// HTTP request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: (message) => logger.info(message.trim()) }
}));


app.use("/api/resume/:foldername/:filename", (req, res) => {
  const filename = req.params.filename;
  const foldername = req.params.foldername;
  const filepath = path.join(__dirname, `/${foldername}`, filename);
  res.sendFile(filepath);
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


app.use("/api/auth", authRoutes);
app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api", candidateRoutes);
app.use("/api", employeeRoutes);
app.use("/api", leaveRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/job-openings", jobOpeningRoutes);
app.use("/api/job-applications", jobApplicationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/attendance-analytics", attendanceAnalyticsRoutes);
app.use("/api/reports", reportRoutes);


// Centralized error handler (should be after routes)
app.use(errorHandler);

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.stack || err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
