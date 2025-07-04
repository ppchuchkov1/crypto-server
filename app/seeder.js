const redisClient = require("./config/redis");
const axios = require("axios");

// NFT колекции (без излишни полета)
const collections = [
  {
    name: "Azuki",
    contract: "0xED5AF388653567Af2F388E6224dC7C4b3241C544",
    description: "Anime-style characters with Japanese aesthetics",
    priceRange: { min: 2.5, max: 8.0 },
  },
  {
    name: "Doodles",
    contract: "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e",
    description: "Bright, colorful cartoon characters",
    priceRange: { min: 0.8, max: 3.2 },
  },
  {
    name: "CryptoPunks",
    contract: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
    description: "Original 8-bit pixel art characters - the OG NFTs",
    priceRange: { min: 15.0, max: 50.0 },
  },
];

// Функция за взимане NFT-та от OpenSea API
async function fetchNFTData(contractAddress, limit = 10) {
  try {
    const response = await axios.get(
      `https://api.opensea.io/api/v2/chain/ethereum/contract/${contractAddress}/nfts`,
      {
        params: { limit },
        headers: {
          Accept: "application/json",
          "User-Agent": "NFT-Seeder/1.0",
          "x-api-key": "d6821387e7ed412698bfc08f3b456be9", // По желание, ако имаш
        },
      }
    );
    const nfts = response.data.nfts || [];
    // Връщаме само NFT-та със снимки (image_url или display_image_url)
    return nfts.filter(
      (nft) =>
        nft.image_url ||
        nft.display_image_url ||
        (nft.metadata && nft.metadata.image)
    );
  } catch (err) {
    console.error("Грешка при fetch:", err.message);
    return [];
  }
}

// Проста функция за генериране рандъм цена в рамките на priceRange
function generatePrice(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 1000) / 1000;
}

// Обогатяване NFT с необходимите полета
function enrichNFT(nft, collection) {
  return {
    id: nft.identifier || nft.token_id || "unknown",
    name: nft.name || `${collection.name} #${nft.identifier || nft.token_id}`,
    description: nft.description || collection.description,
    image_url:
      nft.image_url ||
      nft.display_image_url ||
      (nft.metadata && nft.metadata.image) ||
      null,
    price_eth: generatePrice(
      collection.priceRange.min,
      collection.priceRange.max
    ),
    collection: collection.name,
    contract: collection.contract,
  };
}

async function seedNFTCollectionsToRedis() {
  try {
    await redisClient.connect();

    const allCollections = {};

    for (const col of collections) {
      console.log(`🔄 Взимаме NFT-та за: ${col.name}`);
      const rawNFTs = await fetchNFTData(col.contract, 10);
      if (rawNFTs.length === 0) {
        console.log(`⚠️ Няма NFT-та за колекцията ${col.name}`);
        continue;
      }

      const enrichedNFTs = rawNFTs.map((nft) => enrichNFT(nft, col));

      allCollections[col.name.toLowerCase()] = enrichedNFTs;

      // Малка пауза да не претоварваме API-то
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Записваме всички колекции като един обект JSON под ключ "nft_collections"
    await redisClient.set("nft_collections", JSON.stringify(allCollections));

    console.log("✅ Seed процесът завърши успешно!");
  } catch (error) {
    console.error("❌ Грешка при seed:", error);
  } finally {
    await redisClient.quit();
  }
}

seedNFTCollectionsToRedis();
