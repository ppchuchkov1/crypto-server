const cron = require("node-cron");
const axios = require("axios");
const redis = require("../config/redis");

const fetchCryptoJob = () => {
  // every day in 10:00
  cron.schedule(
    "0 10 * * *",
    async () => {
      try {
        console.log("🕙 Fetching crypto data from CoinGecko...");
        const { data } = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: 30,
              page: 1,
              sparkline: false,
            },
          }
        );

        await redis.set("cryptoData", JSON.stringify(data));
        console.log("✅ Crypto data cached in Redis");
      } catch (error) {
        console.error(
          "❌ Error fetching or saving crypto data:",
          error.message
        );
      }
    },
    {
      timezone: "Europe/Sofia",
    }
  );
};

module.exports = fetchCryptoJob;
