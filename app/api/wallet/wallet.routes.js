const express = require("express");
const verifyToken = require("../../middleware/verifyToken");
const { getWallet } = require("./wallet.controller");

const router = express.Router();

router.get("/", verifyToken, getWallet);

module.exports = router;
