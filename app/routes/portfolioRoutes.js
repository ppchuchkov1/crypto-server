const express = require("express");
const router = express.Router();
const {
  getPortfolio,
  updatePortfolioCurrencies,
} = require("../controllers/portfolioController");
const verifyToken = require("../middleware/verifyToken");

// Вземане на портфолио
router.get("/", verifyToken, getPortfolio);

// Актуализиране на крипто валутите в портфолиото
router.put("/", verifyToken, updatePortfolioCurrencies);

module.exports = router;
