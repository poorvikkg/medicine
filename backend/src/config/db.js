const mongoose = require('mongoose');

const connectDB = async () => {
  // If connection is already open (1) or connecting (2), return immediately
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Do not run process.exit(1) in a serverless environment as it crashes the instance
  }
};

module.exports = connectDB;
