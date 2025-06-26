const express = require("express");
const router = express.Router();
const { getPortfolio } = require("../controllers/portfolioController");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, getPortfolio);

module.exports = router;
