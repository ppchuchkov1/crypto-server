const express = require("express");
const cryptoRoutes = require("./routes/cryptoRoutes");

const app = express();

app.use(express.json());

app.use("/api/crypto", cryptoRoutes);

app.get("/", (req, res) => {
  res.send("Crypto API is working...");
});

module.exports = app;
