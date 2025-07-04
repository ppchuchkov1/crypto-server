const cron = require("node-cron");
const axios = require("axios");
const redis = require("../config/redis");

const fetchCryptoJob = () => {
  // every mouth 10th
  cron.schedule(
    "0 10 10 * *",
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

        const filteredData = data.map((coin) => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price,
          market_cap: coin.market_cap,
          market_cap_rank: coin.market_cap_rank,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          total_supply: coin.total_supply,
          max_supply: coin.max_supply,
        }));

        await redis.set("cryptoData", JSON.stringify(filteredData));
        console.log(`✅ Crypto data cached in Redis (${filteredData.length})`);
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
