const redisClient = require("./config/redis");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// nft collections
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

// fixed eth price
const ETH_TO_USD = 3200;

// fetch nft collections from opensea api
async function fetchNFTData(contractAddress, limit = 10) {
  try {
    const response = await axios.get(
      `https://api.opensea.io/api/v2/chain/ethereum/contract/${contractAddress}/nfts`,
      {
        params: { limit },
        headers: {
          Accept: "application/json",
          "User-Agent": "NFT-Seeder/1.0",
          "x-api-key": "d6821387e7ed412698bfc08f3b456be9",
        },
      }
    );
    const nfts = response.data.nfts || [];
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

// generate price
function generateUSDPrice(min, max) {
  const eth = min + Math.random() * (max - min);
  const usd = eth * ETH_TO_USD;
  return Math.round(usd * 100) / 100;
}

// update nfts
function enrichNFT(nft, collection) {
  return {
    id: uuidv4(),
    name: nft.name || `${collection.name} #${nft.identifier || nft.token_id}`,
    description: nft.description || collection.description,
    image:
      nft.image_url || nft.display_image_url || nft.metadata?.image || null,
    usdPrice: generateUSDPrice(
      collection.priceRange.min,
      collection.priceRange.max
    ),
    collection: collection.name,
    contract: collection.contract,
    ownerId: null,
    isListed: true,
  };
}

async function seedNFTCollectionsToRedis() {
  try {
    await redisClient.connect();

    const allNFTs = [];

    for (const col of collections) {
      console.log(`🔄 Взимаме NFT-та за: ${col.name}`);
      const rawNFTs = await fetchNFTData(col.contract, 10);
      if (rawNFTs.length === 0) {
        console.log(`⚠️ Няма NFT-та за колекцията ${col.name}`);
        continue;
      }

      const enrichedNFTs = rawNFTs.map((nft) => enrichNFT(nft, col));
      allNFTs.push(...enrichedNFTs);

      await new Promise((r) => setTimeout(r, 2000));
    }

    await redisClient.set("nft_collections", JSON.stringify(allNFTs));

    console.log("✅ Seed процесът завърши успешно!");
  } catch (error) {
    console.error("❌ Грешка при seed:", error);
  } finally {
    await redisClient.quit();
  }
}

seedNFTCollectionsToRedis();
