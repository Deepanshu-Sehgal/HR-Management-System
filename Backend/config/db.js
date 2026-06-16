const mongoose = require("mongoose");

// Connect to MongoDB using the connection string from environment variables
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit process if database connection fails
  }
};

module.exports = connectDB; 
