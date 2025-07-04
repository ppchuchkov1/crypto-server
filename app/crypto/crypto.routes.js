const express = require("express");
const { getCryptoData, buyCrypto, sellCrypto } = require("./crypto.controller");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.get("/", getCryptoData);

router.post("/buy", verifyToken, buyCrypto);

router.post("/sell", verifyToken, sellCrypto);

module.exports = router;
