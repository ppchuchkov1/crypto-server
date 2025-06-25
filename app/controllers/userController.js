const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = "supersecretkey123"; // hardcoded secret\

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "The email address already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Wrong email" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Wrong password" });

    // ПРОМЕНЕНО ТУК: изпращаме `id` в payload-а
    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: "1d",
    });

    return res.json({ token, userId: user._id, email: user.email });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login };
