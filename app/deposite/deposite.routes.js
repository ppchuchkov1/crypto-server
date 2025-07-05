const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const {
  createDepositCheckoutSession,
  handleDepositWebhook,
} = require("./deposite.controller");

const router = express.Router();

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
