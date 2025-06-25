const express = require("express");
const cryptoRoutes = require("./routes/cryptoRoutes");
const userRoutes = require("./routes/userRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Crypto API is working...");
});

app.use("/api/crypto", cryptoRoutes);
app.use("/api/users", userRoutes);

app.use("/api/portfolio", portfolioRoutes);

module.exports = app;
