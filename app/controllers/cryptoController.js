const redisClient = require("../config/redis");

const User = require("../models/userModel");
const Portfolio = require("../models/portfolioModel");
const Transaction = require("../models/transactionModel");

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
    const userId = req.user.id; // ид-то от JWT middleware
    const { currency, amount, pricePerUnit } = req.body;

    console.log("Buy request body:", userId);
    if (!currency || !amount || !pricePerUnit) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const totalCost = amount * pricePerUnit;

    // Взимаме user-а
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Взимаме портфолиото
    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      // Ако няма портфолио - създаваме ново с 0 USD баланс и празна крипто листа
      portfolio = new Portfolio({ userId, usdBalance: 0, currencies: [] });
    }

    if (portfolio.usdBalance < totalCost) {
      return res.status(400).json({ message: "Insufficient USD balance" });
    }

    // Изваждаме парите
    portfolio.usdBalance -= totalCost;

    // Добавяме криптовалутата
    const existingCurrency = portfolio.currencies.find(
      (c) => c.name === currency
    );
    if (existingCurrency) {
      existingCurrency.amount += amount;
    } else {
      portfolio.currencies.push({ name: currency, amount });
    }

    await portfolio.save();

    // Записваме транзакция
    const transaction = new Transaction({
      userId,
      type: "buy",
      currency: currency,
      amount,
      pricePerUnit,
      total: totalCost,
    });
    await transaction.save();

    res.status(200).json({
      message: "Crypto purchased successfully",
      usdBalance: portfolio.usdBalance,
      portfolio: portfolio.currencies,
    });
  } catch (error) {
    console.error("Buy crypto error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const sellCrypto = async (req, res) => {
  try {
    const userId = req.user.id; // взимаме userId от middleware-а
    const { currency, amount, pricePerUnit } = req.body;

    if (!currency || !amount || !pricePerUnit) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const totalGain = amount * pricePerUnit;

    // Взимаме портфолиото
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio)
      return res.status(404).json({ message: "Portfolio not found" });

    // Проверяваме дали има достатъчно количество от криптото за продажба
    const existingCurrency = portfolio.currencies.find(
      (c) => c.name === currency
    );
    if (!existingCurrency || existingCurrency.amount < amount) {
      return res
        .status(400)
        .json({ message: "Insufficient cryptocurrency amount" });
    }

    // Намаляваме количеството на криптото
    existingCurrency.amount -= amount;

    // Ако количеството стане 0 или по-малко, премахваме криптото от листата
    if (existingCurrency.amount <= 0) {
      portfolio.currencies = portfolio.currencies.filter(
        (c) => c.name !== currency
      );
    }

    // Добавяме USD към баланса
    portfolio.usdBalance += totalGain;

    await portfolio.save();

    // Записваме транзакция
    const transaction = new Transaction({
      userId,
      type: "sell",
      currency,
      amount,
      pricePerUnit,
      total: totalGain,
    });
    await transaction.save();

    res.status(200).json({
      message: "Crypto sold successfully",
      usdBalance: portfolio.usdBalance,
      portfolio: portfolio.currencies,
    });
  } catch (error) {
    console.error("Sell crypto error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getCryptoData, buyCrypto, sellCrypto };
