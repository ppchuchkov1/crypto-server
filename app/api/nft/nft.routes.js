const express = require("express");
const verifyToken = require("../../middleware/verifyToken");
const { getNFTs, listNFT, buyNFT, unlistNFT } = require("./nft.controller");

const router = express.Router();

router.get("/", getNFTs);
router.post("/list", verifyToken, listNFT);
router.post("/unlist", verifyToken, unlistNFT);
router.post("/buy", verifyToken, buyNFT);

module.exports = router;
