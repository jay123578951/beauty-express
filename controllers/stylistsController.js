const connection = require("../database");

// 取得設計師 API
exports.getStylists = (req, res) => {
  connection.query(
    "SELECT id, name, photo, email, phone, specialty FROM stylists",
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No stylists found" });
      }

      res.json(results);
    }
  );
};
