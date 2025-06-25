const mongoose = require("mongoose");

const CurrencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // напр. "BTC"
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  usdBalance: { type: Number, default: 0 }, // пари заредени чрез Stripe
  currencies: { type: [CurrencySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Portfolio", PortfolioSchema);
