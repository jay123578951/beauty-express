const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const session = require("express-session");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000 ", // 設定允許的來源
    credentials: true, // 啟用 cookies
  })
);

// 使用 session 中介軟體
app.use(
  session({
    secret: "userSecret", // 設定 session 密鑰
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // 開發環境下可以設為 false
      httpOnly: true, // 增加安全性，防止客戶端腳本存取
    },
  })
);

// 使用中間件解析 JSON
app.use(express.json());

// 創建資料庫連接
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Jay0987847647@", // 替換為你的密碼
  database: "beauty_database", // 替換為你的資料庫名稱
});

// 測試連接
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database");
});

// 根路由
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// 登入 API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  connection.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Database error");
      }

      if (results.length > 0) {
        const user = results[0];
        // 比對密碼
        if (password === user.password) {
          req.session.user = user; // 記錄使用者的登入狀態

          // 設定 cookie 存儲登入資訊
          res.cookie(
            "user",
            JSON.stringify({ id: user.id, username: user.username }),
            {
              httpOnly: true, // 防止 JavaScript 讀取該 cookie
              secure: process.env.NODE_ENV === "production", // 只在 HTTPS 下發送 cookie
              maxAge: 1000 * 60 * 60 * 24, // 設定 cookie 失效時間（24 小時）
            }
          );

          return res.send({
            message: "Login successful",
            user: { id: user.id, username: user.username },
          });
        } else {
          return res.status(401).send("Invalid credentials");
        }
      } else {
        return res.status(401).send("User not found");
      }
    }
  );
});

// 登出 API
app.post("/api/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);

        return res.status(500).send("Failed to logout");
      } else {
        res.clearCookie("connect.sid");

        return res.send("Logout successful");
      }
    });
  } else {
    return res.status(400).send("No active session");
  }
});

// 檢查登入狀態 API
app.get("/api/session", (req, res) => {
  if (req.session.user) {
    const user = {
      id: req.session.user.id,
      username: req.session.user.username,
    };

    res.json({
      user: user,
      loggedIn: true,
    });

    return res.json(user);
  } else {
    res.status(401).json({
      isLoggedIn: false,
      message: "Unauthorized",
    });
  }
});

// 啟動伺服器
app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
