const express = require("express");
const router = express.Router();
const {
  // getAllStores,
  filterStores,
  storeMenus,
  menuInfo,
} = require("../controllers/storeController");

// router.get("/", getAllStores); // GET /api/stores
router.get("/", filterStores); // GET /api/stores
router.get("/:storeId/menus", storeMenus); // GET /api/stores//:storeId/menus
router.get("/:storeId/menus/:menuId", menuInfo); // GET /api/stores//:storeId/menus

module.exports = router;
