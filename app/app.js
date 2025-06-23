// app/app.js
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 5000;

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/banking";

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Test schema
const TestSchema = new mongoose.Schema({ name: String });
const TestModel = mongoose.model("Test", TestSchema);

// Routes
app.get("/", (req, res) => {
  // res.send("Test upload new code to222");
});

app.get("/ping-db", async (req, res) => {
  try {
    const testDoc = new TestModel({ name: "Test from API" });
    await testDoc.save();

    const docs = await TestModel.find();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
