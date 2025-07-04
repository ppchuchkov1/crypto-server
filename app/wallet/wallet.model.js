const mongoose = require("mongoose");

const CurrencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    image: { type: String },
  },
  { _id: false }
);

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  usdBalance: { type: Number, default: 0 },
  currencies: { type: [CurrencySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Wallet", WalletSchema);
