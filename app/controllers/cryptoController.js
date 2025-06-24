const redisClient = require("../config/redis");

const getCryptoData = async (req, res) => {
  try {
    const cachedData = await redisClient.get("cryptoData");

    if (cachedData) {
      console.log("📦 Serving data from Redis cache");
      return res.status(200).json(JSON.parse(cachedData));
    } else {
      return res.status(404).json({ message: "No cached data available yet" });
    }
  } catch (error) {
    console.error("❌ Redis read error:", error.message);
    res.status(500).json({ message: "Failed to retrieve crypto data" });
  }
};

module.exports = { getCryptoData };
