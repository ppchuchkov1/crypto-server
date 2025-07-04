const express = require("express");
const { getNFTs } = require("./nft.controller");

const router = express.Router();

router.get("/", getNFTs);

module.exports = router;
