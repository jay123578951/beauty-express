const express = require("express");
const router = express.Router();
const { getStylists } = require("../controllers/stylistsController");

router.get("/", getStylists); // GET /api/stylists

module.exports = router;
