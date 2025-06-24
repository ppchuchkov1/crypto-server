const express = require("express");
const { getCryptoData } = require("../controllers/cryptoController");

const router = express.Router();

router.get("/", getCryptoData);

module.exports = router;
