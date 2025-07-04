const express = require("express");
const {
  getWallet,
  createDepositCheckoutSession,
  handleDepositWebhook,
} = require("../controllers/wallet.controller");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.get("/", verifyToken, getWallet);
router.post(
  "/create-deposit-checkout-session",
  verifyToken,
  createDepositCheckoutSession
);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleDepositWebhook
);

module.exports = router;
