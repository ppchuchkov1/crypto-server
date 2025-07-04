const redisClient = require("../config/redis");

const getNFTs = async (req, res) => {
  try {
    const cachedNFTs = await redisClient.get("nft_collections");

    if (!cachedNFTs) {
      return res.status(404).json({ message: "❌ Няма NFT-та в кеша" });
    }

    const nfts = JSON.parse(cachedNFTs);
    return res.status(200).json(nfts);
  } catch (error) {
    console.error("❌ Redis fetch error:", error.message);
    return res
      .status(500)
      .json({ message: "Сървърен проблем при взимане на NFT-та" });
  }
};

module.exports = { getNFTs };
