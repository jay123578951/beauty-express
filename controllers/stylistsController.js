const connection = require("../database");

// 取得設計師 API
exports.getStylists = (req, res) => {
  const storeId = req.query.store_id;

  if (!storeId) {
    return res.status(400).json({ error: "store_id is required" }); // 若未提供 store_id，回傳錯誤
  }

  const query = `
    SELECT id, name, photo, email, phone, specialty 
    FROM stylists 
    WHERE store_id = ?
  `;

  connection.query(query, [storeId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No stylists found for the specified store" });
    }

    res.json(results);
  });
};
