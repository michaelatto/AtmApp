const pool = require("../config/db");

exports.getBalance = async (req, res) => {

  const user = await pool.query(
    "SELECT balance FROM users WHERE id=$1",
    [req.user.id]
  );

  res.json(user.rows[0]);
};

exports.deposit = async (req, res) => {

  const { amount } = req.body;

  await pool.query(
    "UPDATE users SET balance = balance + $1 WHERE id=$2",
    [amount, req.user.id]
  );

  await pool.query(
    "INSERT INTO transactions (user_id,type,amount) VALUES ($1,$2,$3)",
    [req.user.id, "deposit", amount]
  );

  res.json({ message: "Deposit successful" });
};

exports.withdraw = async (req, res) => {

  const { amount } = req.body;

  const user = await pool.query(
    "SELECT balance FROM users WHERE id=$1",
    [req.user.id]
  );

  if (user.rows[0].balance < amount)
    return res.status(400).json({ message: "Insufficient funds" });

  await pool.query(
    "UPDATE users SET balance = balance - $1 WHERE id=$2",
    [amount, req.user.id]
  );

  res.json({ message: "Withdraw successful" });
};

exports.getTransactions = async (req, res) => {
  const result = await pool.query(
    "SELECT type, amount, created_at FROM transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
    [req.user.id]
  );
  res.json(result.rows);
};
