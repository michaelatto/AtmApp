const express = require("express");
const router = express.Router();
const account = require("../controllers/accountController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/balance", authMiddleware, account.getBalance);
router.get("/transactions", authMiddleware, account.getTransactions);
router.post("/deposit", authMiddleware, account.deposit);
router.post("/withdraw", authMiddleware, account.withdraw);

module.exports = router;
