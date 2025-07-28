const express = require("express");
const verifyToken = require("../../middleware/verifyToken");
const { getWallet, updateSlotBalance } = require("./wallet.controller");

const router = express.Router();

router.get("/", verifyToken, getWallet);
router.post("/slot-update", verifyToken, updateSlotBalance);

module.exports = router;
