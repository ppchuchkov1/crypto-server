const redisClient = require("../../config/redis");
const Wallet = require("../wallet/wallet.model");

const getNFTs = async (req, res) => {
  try {
    const cachedNFTs = await redisClient.get("nft_collections");
    console.log("🔍 Raw cached data:", cachedNFTs);

    if (!cachedNFTs) {
      return res.status(404).json({ message: "❌ Няма NFT-та в кеша" });
    }

    const allNFTs = JSON.parse(cachedNFTs);
    const listedNFTs = allNFTs.filter((nft) => nft.isListed === true);

    return res.status(200).json(listedNFTs);
  } catch (error) {
    console.error("❌ Redis fetch error:", error.message);
    return res
      .status(500)
      .json({ message: "Сървърен проблем при взимане на NFT-та" });
  }
};

const listNFT = async (req, res) => {
  try {
    const { nftId, price } = req.body;
    const userId = req.user.id;

    if (!nftId || price === undefined) {
      return res
        .status(400)
        .json({ message: "❌ nftId и price са задължителни" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "❌ Wallet not found" });
    }

    const nft = wallet.nfts.find((n) => n.id === nftId);
    if (!nft) {
      return res.status(404).json({ message: "❌ NFT not found in wallet" });
    }

    const cachedNFTs = await redisClient.get("nft_collections");
    const nfts = cachedNFTs ? JSON.parse(cachedNFTs) : [];

    const alreadyListed = nfts.find(
      (n) => n.id === nftId && n.isListed && n.ownerId === userId
    );
    if (alreadyListed) {
      return res.status(400).json({ message: "❌ NFT is already listed" });
    }

    const nftIndex = nfts.findIndex((n) => n.id === nftId);

    if (nftIndex !== -1) {
      nfts[nftIndex] = {
        ...nfts[nftIndex],
        ownerId: userId,
        isListed: true,
        usdPrice: price, // update price
      };
    } else {
      const listedNFT = {
        id: nft.id,
        name: nft.name,
        description: nft.description,
        image: nft.image,
        usdPrice: price, // add new price
        collection: nft.collection,
        contract: nft.contract,
        ownerId: userId,
        isListed: true,
      };
      nfts.push(listedNFT);
    }

    // new price and isListed = true in wallet
    const walletNFTIndex = wallet.nfts.findIndex((n) => n.id === nftId);
    if (walletNFTIndex !== -1) {
      wallet.nfts[walletNFTIndex].isListed = true;
      wallet.nfts[walletNFTIndex].usdPrice = price;
      await wallet.save();
    }

    await redisClient.set("nft_collections", JSON.stringify(nfts));

    res.status(201).json({
      message: "✅ NFT listed successfully",
      nft: nfts[nftIndex !== -1 ? nftIndex : nfts.length - 1],
    });
  } catch (error) {
    console.error("❌ List NFT error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const unlistNFT = async (req, res) => {
  try {
    const { nftId } = req.body;
    const userId = req.user.id;

    const cachedNFTs = await redisClient.get("nft_collections");
    if (!cachedNFTs)
      return res.status(404).json({ message: "❌ No NFTs found" });

    const nfts = JSON.parse(cachedNFTs);
    const nftIndex = nfts.findIndex((n) => n.id === nftId);

    if (nftIndex === -1)
      return res.status(404).json({ message: "NFT not found" });

    const nft = nfts[nftIndex];
    if (nft.ownerId !== userId) {
      return res.status(403).json({ message: "❌ Not your NFT to unlist" });
    }

    if (!nft.isListed) {
      return res.status(400).json({ message: "NFT is already unlisted" });
    }

    nfts[nftIndex].isListed = false;

    // update wallet NFT isListed = false
    const wallet = await Wallet.findOne({ userId });
    if (wallet) {
      const walletNFTIndex = wallet.nfts.findIndex((n) => n.id === nftId);
      if (walletNFTIndex !== -1) {
        wallet.nfts[walletNFTIndex].isListed = false;
        await wallet.save();
      }
    }

    await redisClient.set("nft_collections", JSON.stringify(nfts));

    res.status(200).json({ message: "✅ NFT unlisted successfully" });
  } catch (error) {
    console.error("❌ Unlist NFT error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const buyNFT = async (req, res) => {
  try {
    const { nftId } = req.body;
    const buyerId = req.user.id;

    const cachedNFTs = await redisClient.get("nft_collections");
    if (!cachedNFTs)
      return res.status(404).json({ message: "❌ No NFTs found" });

    const nfts = JSON.parse(cachedNFTs);
    const nftIndex = nfts.findIndex(
      (n) => n.id === nftId && n.isListed && n.ownerId !== buyerId
    );
    if (nftIndex === -1)
      return res.status(404).json({ message: "NFT not found or already sold" });

    const nft = nfts[nftIndex];

    const buyerWallet = await Wallet.findOne({ userId: buyerId });
    if (!buyerWallet)
      return res.status(404).json({ message: "❌ Buyer wallet not found" });

    if (buyerWallet.usdBalance < nft.usdPrice) {
      return res.status(400).json({ message: "❌ Not enough USD balance" });
    }

    buyerWallet.usdBalance -= nft.usdPrice;
    buyerWallet.nfts.push({
      id: nft.id,
      name: nft.name,
      description: nft.description,
      image: nft.image,
      usdPrice: nft.usdPrice,
      collection: nft.collection,
      contract: nft.contract,
      isListed: false, // buyed not listed
    });
    await buyerWallet.save();

    // add price amonut to seller user
    if (nft.ownerId) {
      const sellerWallet = await Wallet.findOne({ userId: nft.ownerId });
      if (sellerWallet) {
        sellerWallet.usdBalance += nft.usdPrice;
        sellerWallet.nfts = sellerWallet.nfts.filter((n) => n.id !== nft.id);
        await sellerWallet.save();
      }
    }

    // update redis
    nfts[nftIndex].ownerId = buyerId;
    nfts[nftIndex].isListed = false;
    await redisClient.set("nft_collections", JSON.stringify(nfts));

    res.status(200).json({
      message: "✅ NFT bought successfully",
      nft: nfts[nftIndex],
    });
  } catch (error) {
    console.error("❌ Buy NFT error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getNFTs, listNFT, buyNFT, unlistNFT };
