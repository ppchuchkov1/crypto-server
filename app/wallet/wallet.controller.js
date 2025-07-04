const Stripe = require("stripe");
const Wallet = require("./wallet.model");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, usdBalance: 1000, currencies: [] });
      await wallet.save();
    }

    res.status(200).json({ wallet });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const createDepositCheckoutSession = async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Deposit to wallet" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: { userId },
      success_url: "https://crypto-client-rust.vercel.app/deposite/success",
      cancel_url: "https://crypto-client-rust.vercel.app/deposite/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Create deposit checkout session error:", error);
    res.status(500).json({ error: error.message });
  }
};

const handleDepositWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const amount = session.amount_total / 100;

    try {
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { usdBalance: amount } },
        { new: true }
      );
      console.log(`Wallet updated for user ${userId}: +$${amount}`);
    } catch (error) {
      console.error("Failed to update wallet:", error.message);
    }
  }

  res.status(200).json({ received: true });
};

module.exports = {
  getWallet,
  createDepositCheckoutSession,
  handleDepositWebhook,
};
