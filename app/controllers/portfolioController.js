const Portfolio = require("../models/portfolioModel");

const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = new Portfolio({ userId, usdBalance: 1000, currencies: [] });
      await portfolio.save();
    }

    res.status(200).json({ portfolio });
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPortfolio };
