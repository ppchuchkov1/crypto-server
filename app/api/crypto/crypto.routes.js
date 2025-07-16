const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/verifyToken");
const { getCryptoData, buyCrypto, sellCrypto } = require("./crypto.controller");

router.get("/", getCryptoData);

router.post("/buy", verifyToken, buyCrypto);

router.post("/sell", verifyToken, sellCrypto);

module.exports = router;
