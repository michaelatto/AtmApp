const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// ✅ Register (password + pin)
router.post("/register", authController.register);

// ✅ Login (password)
router.post("/login", authController.login);

// ✅ Login (pin)
router.post("/pin-login", authController.pinLogin);

module.exports = router;