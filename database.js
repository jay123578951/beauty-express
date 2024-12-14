const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: "Z",
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit("error");
  } else {
    console.log("Connected to the database.");
  }
});

module.exports = connection;
