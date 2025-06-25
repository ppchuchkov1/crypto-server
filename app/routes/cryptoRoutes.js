const express = require("express");
const { getCryptoData } = require("../controllers/cryptoController");
const { buyCrypto, sellCrypto } = require("../controllers/cryptoController");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.get("/", getCryptoData);

router.post("/buy", verifyToken, buyCrypto);

router.post("/sell", verifyToken, sellCrypto);

module.exports = router;
