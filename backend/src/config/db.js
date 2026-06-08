const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('CRITICAL ERROR: MONGO_URI environment variable is not defined!');
    process.exit(1);
  }

  // Setup connection event listeners
  mongoose.connection.on('connecting', () => {
    console.log('Connecting to MongoDB Atlas...');
  });

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB connection re-established.');
  });

  // If connection is already open (1) or connecting (2), return immediately
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const connOptions = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  };

  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(mongoURI, connOptions);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      break;
    } catch (error) {
      retries -= 1;
      console.error(`MongoDB connection attempt failed. Error: ${error.message}`);
      if (retries === 0) {
        console.error('CRITICAL ERROR: Failed to connect to MongoDB after 5 attempts. Exiting...');
        process.exit(1);
      }
      console.log(`Retrying connection in 5 seconds... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;
