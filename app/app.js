const express = require("express");
const cryptoRoutes = require("./api/crypto/crypto.routes");
const userRoutes = require("./api/auth/auth.routes");
const walletRoutes = require("./api/wallet/wallet.routes");
const nftRoutes = require("./api/nft/nft.routes");
const depositeRoutes = require("./api/deposite/deposite.routes");
const app = express();

app.get("/", (req, res) => {
  res.send("Crypto API is working");
});

// before express.json() because of Stripe
app.use("/api/wallet", depositeRoutes);

app.use(express.json());
app.use("/api/crypto", cryptoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/nfts", nftRoutes);

module.exports = app;
