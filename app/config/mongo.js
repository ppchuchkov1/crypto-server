const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/crypto";

async function connectDB() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected");
});

module.exports = connectDB;
