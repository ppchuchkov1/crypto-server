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

const updateSlotBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { betAmount, winAmount, isWin } = req.body;

    if (
      typeof betAmount !== "number" ||
      typeof winAmount !== "number" ||
      typeof isWin !== "boolean"
    ) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Изчисляваме новата сума
    let newBalance;
    if (isWin) {
      // При печалба: добавяме печалбата към баланса
      newBalance = wallet.usdBalance + winAmount;
    } else {
      // При загуба: изваждаме залога от баланса
      newBalance = wallet.usdBalance - betAmount;
    }

    // Проверяваме дали новата сума не е отрицателна
    if (newBalance < 0) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Обновяваме баланса
    wallet.usdBalance = newBalance;
    wallet.updatedAt = new Date();
    await wallet.save();

    res.status(200).json({
      success: true,
      newBalance: wallet.usdBalance,
      message: isWin ? `Won $${winAmount}` : `Lost $${betAmount}`,
    });
  } catch (error) {
    console.error("Update slot balance error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getWallet,
  updateSlotBalance,
};
