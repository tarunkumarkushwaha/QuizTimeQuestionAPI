const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
  try {
    mongoose.set('sanitizeFilter', true);
    await mongoose.connect(process.env.MONGO_URI);
    // mongoose.set('debug', true);
    console.log(" Connected to MongoDB Atlas");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

module.exports = connectDB;

