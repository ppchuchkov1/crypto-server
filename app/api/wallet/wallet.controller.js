const Wallet = require("./wallet.model");

const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({
        userId,
        usdBalance: 1000,
        currencies: [],
        nfts: [],
      });
      await wallet.save();
    }

    res.status(200).json({ wallet });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getWallet,
};
