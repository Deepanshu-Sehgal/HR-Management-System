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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require("fs");
const path = require("path");
// HTTP request logger (integrated with winston)
const morgan = require('morgan');
// Application-wide logger (winston) and error middleware
const logger = require('./utils/logger');
const errorHandler = require('./utils/errorHandler');
const Leave = require("./models/Leave");


dotenv.config();


connectDB();

const app = express();


// Security: set HTTP headers to sensible defaults
app.use(helmet());

// CORS: restrict origins via `CORS_ORIGINS` env var (comma-separated). If unset, allow all.
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: function(origin, callback) {
    // allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

// Serve uploaded files from /uploads
app.use(express.static(path.join(__dirname, "uploads")));
// Parse JSON request bodies
app.use(express.json());

// Rate limiter: basic protection against brute-force and spiky traffic
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW_MINUTES ? parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) : 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// HTTP request logging: morgan writes logs into winston for unified logging
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


// Centralized error handler (must come after all routes)
app.use(errorHandler);

// Optional: handle process-level errors to avoid silent crashes
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.stack || err);
  // In many setups it's safer to crash and let a process manager restart the app
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

const PORT = process.env.PORT || 5000;
// Start server and log via the configured logger
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
