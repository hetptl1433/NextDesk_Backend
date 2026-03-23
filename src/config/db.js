const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB connected");
  } catch (error) {
    const hint =
      "Check that MongoDB is running and that MONGODB_URI in .env points to a reachable database.";
    throw new Error(`${error.message}. ${hint}`);
  }
};

module.exports = connectDB;
