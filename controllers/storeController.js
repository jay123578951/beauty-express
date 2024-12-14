const connection = require("../database");

// 撈取所有店家的資料
// exports.getAllStores = (req, res) => {
//   const query = "SELECT * FROM stores";

//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Database error:", err);
//       return res.status(500).json({ error: "Database error" });
//     }

//     res.json({
//       message: "Store list retrieved successfully",
//       stores: results,
//     });
//   });
// };

// 篩選店家 API
exports.filterStores = (req, res) => {
  const { store, location, services } = req.query;

  let query = `
    SELECT DISTINCT s.*
    FROM stores s
    LEFT JOIN store_services ss ON s.id = ss.store_id
    LEFT JOIN services sv ON ss.service_id = sv.id
    LEFT JOIN areas a ON s.area_id = a.id
    WHERE 1 = 1
  `;

  const params = [];

  // 關鍵字篩選
  if (store) {
    query += " AND (s.name LIKE ? OR s.description LIKE ?)";
    params.push(`%${store}%`, `%${store}%`);
  }

  // 地區篩選
  if (location) {
    query += " AND a.name = ?";
    params.push(location);
  }

  // 日期區間篩選
  // if (startDate && endDate) {
  //   query += " AND (sa.available_date BETWEEN ? AND ?)";
  //   params.push(startDate, endDate);
  // }

  // 服務篩選
  if (services) {
    query += " AND sv.name = ?";
    params.push(services);
  }

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.json(results);
  });
};

// 服務方案 API
exports.storeMenus = (req, res) => {
  const { storeId } = req.params;

  connection.query(
    "SELECT * FROM store_menus WHERE store_id = ?",
    [storeId],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No offers found for this store" });
      }

      res.json(results);
    }
  );
};

// 方案細節 API
exports.menuInfo = (req, res) => {
  const { storeId, menuId } = req.params;

  connection.query(
    `SELECT m.*, m.name as menu_name, s.name as store_name, s.location
     FROM store_menus m
     JOIN stores s ON m.store_id = s.id
     WHERE m.id = ? AND m.store_id = ?`,
    [menuId, storeId],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Menu not found for this salon" });
      }

      res.json({
        salon: {
          id: storeId,
          name: results[0].store_name,
          location: results[0].location,
        },
        menu: {
          ...results[0],
          name: results[0].menu_name,
        },
      });
    }
  );
};
