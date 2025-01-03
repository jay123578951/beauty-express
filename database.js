const mysql = require("mysql2");

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: "Z", // 設置時區
  connectionLimit: 10, // 最大連線數
  waitForConnections: true, // 等待可用連線
  queueLimit: 0, // 不限制請求數量
});

// 測試連線池是否正常
connection.getConnection((err, connection) => {
  if (err) {
    console.error("Failed to connect to the database:", err);
    process.exit("error");
  } else {
    console.log("Successfully connected to the database.");
    connection.release(); // 釋放連線
  }
});

module.exports = connection;
