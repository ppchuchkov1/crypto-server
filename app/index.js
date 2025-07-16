const app = require("./app");
const redisClient = require("./config/redis");
const connectDB = require("./config/mongo");
const fetchCryptoJob = require("./jobs/fetchCryptoJob");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running ${PORT}`);
});

(async () => {
  try {
    await redisClient.connect();

    await connectDB();

    fetchCryptoJob();
  } catch (error) {
    console.warn("⚠️ Optional service failed:", error.message);
  }
})();
