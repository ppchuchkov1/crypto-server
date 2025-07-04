const redisClient = require("../config/redis");
const User = require("../auth/auth.model");
const Wallet = require("../wallet/wallet.model");
const Transaction = require("../transactions/transaction.model");

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
const buyCrypto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currency, amount, pricePerUnit, image } = req.body;

    if (!currency || amount == null || pricePerUnit == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedAmount = amount;
    const parsedPrice = pricePerUnit;
    console.log(amount, pricePerUnit);

    if (
      isNaN(parsedAmount) ||
      isNaN(parsedPrice) ||
      parsedAmount <= 0 ||
      parsedPrice <= 0
    ) {
      return res
        .status(400)
        .json({ message: "Amount and price must be valid positive numbers" });
    }

    const totalCost = parsedAmount * parsedPrice;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, usdBalance: 1000, currencies: [] });
    }

    if (wallet.usdBalance < totalCost) {
      return res.status(400).json({ message: "Insufficient USD balance" });
    }

    wallet.usdBalance -= totalCost;

    const existingCurrency = wallet.currencies.find((c) => c.name === currency);
    if (existingCurrency) {
      existingCurrency.amount += parsedAmount;
      if (image) {
        existingCurrency.image = image;
      }
    } else {
      wallet.currencies.push({ name: currency, amount: parsedAmount, image });
    }

    await wallet.save();

    const transaction = new Transaction({
      userId,
      type: "buy",
      currency,
      amount: parsedAmount,
      pricePerUnit: parsedPrice,
      total: totalCost,
    });
    await transaction.save();

    res.status(200).json({
      message: "Crypto purchased successfully",
      usdBalance: wallet.usdBalance,
      wallet: wallet.currencies,
    });
  } catch (error) {
    console.error("Buy crypto error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sellCrypto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currency, amount, pricePerUnit } = req.body;

    if (!currency || amount == null || pricePerUnit == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedAmount = parseFloat(amount);
    const parsedPrice = parseFloat(pricePerUnit);

    if (
      isNaN(parsedAmount) ||
      isNaN(parsedPrice) ||
      parsedAmount <= 0 ||
      parsedPrice <= 0
    ) {
      return res
        .status(400)
        .json({ message: "Amount and price must be valid positive numbers" });
    }

    const totalGain = parsedAmount * parsedPrice;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    const existingCurrency = wallet.currencies.find((c) => c.name === currency);
    if (!existingCurrency || existingCurrency.amount < parsedAmount) {
      return res
        .status(400)
        .json({ message: "Insufficient cryptocurrency amount" });
    }

    existingCurrency.amount -= parsedAmount;

    if (existingCurrency.amount <= 0) {
      wallet.currencies = wallet.currencies.filter((c) => c.name !== currency);
    }

    wallet.usdBalance += totalGain;

    await wallet.save();

    const transaction = new Transaction({
      userId,
      type: "sell",
      currency,
      amount: parsedAmount,
      pricePerUnit: parsedPrice,
      total: totalGain,
    });
    await transaction.save();

    res.status(200).json({
      message: "Crypto sold successfully",
      usdBalance: wallet.usdBalance,
      wallet: wallet.currencies,
    });
  } catch (error) {
    console.error("Sell crypto error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getCryptoData, buyCrypto, sellCrypto };
