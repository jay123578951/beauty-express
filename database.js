const mysql = require("mysql2");

console.log(process.env.DB_USER);

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Jay0987847647@",
  database: "beauty_database",

  // host: process.env.DB_HOST,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,

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
