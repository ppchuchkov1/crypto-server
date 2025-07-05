const express = require("express");
const cryptoRoutes = require("./crypto/crypto.routes");
const userRoutes = require("./auth/auth.routes");
const walletRoutes = require("./wallet/wallet.routes");
const nftRoutes = require("./nft/nft.routes");
const depositeRoutes = require("./deposite/deposite.routes");
const app = express();

app.get("/", (req, res) => {
  res.send("Crypto API is working");
});
app.use("/api/wallet", depositeRoutes);

app.use(express.json());
app.use("/api/crypto", cryptoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/nfts", nftRoutes);

module.exports = app;
