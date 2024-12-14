const express = require("express");
const router = express.Router();
const {
  login,
  logout,
  checkAuth,
  getProfile,
} = require("../controllers/authController");

router.post("/login", login); // POST /api/auth/login
router.post("/logout", logout); // POST /api/auth/logout
router.get("/check-auth", checkAuth); // GET /api/auth/check-auth
router.post("/profile", getProfile); // POST /api/auth/profile

module.exports = router;
