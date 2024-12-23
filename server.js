const express = require("express");
const session = require("express-session");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json()); // 解析 JSON

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

// 載入路由模組
const authRoutes = require("./routes/auth");
const storeRoutes = require("./routes/stores");
const stylistsRoutes = require("./routes/stylists");
const appointmentsRoutes = require("./routes/appointments");

app.use("/api/auth", authRoutes); // 使用 /auth 路徑來處理登入相關路由
app.use("/api/stores", storeRoutes); // 使用 /stores 路徑來處理店家相關路由
app.use("/api/stylists", stylistsRoutes); // 使用 /stylists 路徑來處理設計師相關路由
app.use("/api/appointments", appointmentsRoutes); // 使用 /appointments 路徑來處理預約相關路由

// 根路由
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// 啟動伺服器
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://<EC2_IP_ADDRESS>:${PORT}`);
});
