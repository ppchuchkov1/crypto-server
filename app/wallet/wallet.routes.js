const express = require("express");
const { getWallet } = require("./wallet.controller");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.get("/", verifyToken, getWallet);

module.exports = router;
