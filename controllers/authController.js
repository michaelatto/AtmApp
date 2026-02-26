const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ✅ REGISTER (password + pin)
exports.register = async (req, res) => {
  try {
    const { name, email, password, pin } = req.body;

    if (!name || !email || !password || !pin) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // PIN must be 4 digits
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: "PIN must be 4 digits" });
    }

    // check if user exists
    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(pin, 10);

    await pool.query(
      "INSERT INTO users (name, email, password, pin_hash) VALUES ($1,$2,$3,$4)",
      [name, email, hashedPassword, hashedPin]
    );

    return res.json({ message: "User registered successfully" });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ LOGIN (password)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const ok = await bcrypt.compare(password, user.rows[0].password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ PIN LOGIN
exports.pinLogin = async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (!email || !pin) {
      return res.status(400).json({ message: "Email and PIN required" });
    }

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const ok = await bcrypt.compare(pin, user.rows[0].pin_hash || "");
    if (!ok) {
      return res.status(400).json({ message: "Invalid PIN" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (err) {
    console.log("PIN LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};