const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["buy", "sell"], required: true },
  currency: { type: String, required: true }, // напр. "BTC"
  amount: { type: Number, required: true }, // колко крипто сме купили/продали
  pricePerUnit: { type: Number, required: true }, // цена на единица при транзакцията
  total: { type: Number, required: true }, // amount * pricePerUnit
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
