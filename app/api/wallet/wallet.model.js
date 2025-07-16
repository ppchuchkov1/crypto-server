const mongoose = require("mongoose");

const CurrencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    image: { type: String },
  },
  { _id: false }
);

const NFTScheme = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  image: String,
  usdPrice: Number,
  collection: String,
  contract: String,
  isListed: Boolean,
});

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
  nfts: { type: [NFTScheme], default: [] },
});

module.exports = mongoose.model("Wallet", WalletSchema);
