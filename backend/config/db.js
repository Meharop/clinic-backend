// This file connects to MongoDB database
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to local MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // Stop the app if database fails
  }
};

module.exports = connectDB;