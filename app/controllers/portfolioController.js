const Portfolio = require("../models/portfolioModel");

const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      // Ако няма портфолио - създаваме ново с 1000 USD баланс и празна крипто листа
      portfolio = new Portfolio({ userId, usdBalance: 1000, currencies: [] });
      await portfolio.save();
    }

    res.status(200).json({ portfolio });
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePortfolioCurrencies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currencies } = req.body;

    if (!Array.isArray(currencies)) {
      return res.status(400).json({ message: "Currencies must be an array" });
    }

    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    portfolio.currencies = currencies;
    await portfolio.save();

    res.status(200).json({ message: "Portfolio updated", portfolio });
  } catch (error) {
    console.error("Update portfolio error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPortfolio, updatePortfolioCurrencies };
