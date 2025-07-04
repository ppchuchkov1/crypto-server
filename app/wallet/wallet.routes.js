const express = require("express");
const router = express.Router();
const { getWallet } = require("./wallet.controller");
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, getWallet);

module.exports = router;
