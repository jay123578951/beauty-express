const connection = require("../database");

// 登入 API
exports.login = (req, res) => {
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
          res.cookie("userId", user.uuid, {
            httpOnly: true, // 防止 JavaScript 讀取該 Cookie
            secure: process.env.NODE_ENV === "production", // 只在 HTTPS 下發送
            maxAge: 1000 * 60 * 60 * 24, // 24 小時過期
          });

          return res.send({
            message: "Login successful",
            user: { id: user.id, username: user.username, uuid: user.uuid },
          });
        } else {
          return res.status(401).send("Invalid credentials");
        }
      } else {
        return res.status(401).send("User not found");
      }
    }
  );
};

// 登出 API
exports.logout = (req, res) => {
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
};

// 檢查登入狀態 API
exports.checkAuth = (req, res) => {
  if (req.session.user) {
    return res.json({
      isLoggedIn: true,
      user: {
        id: req.session.user.id,
        username: req.session.user.username,
        uuid: req.session.user.uuid,
      },
    });
  } else {
    return res.json({ isLoggedIn: false });
  }
};

// 獲取用戶資料 API
exports.getProfile = (req, res) => {
  const uuid = req.body?.id;

  if (!uuid) {
    return res.status(401).send("User not authenticated");
  }

  connection.query(
    "SELECT username, uuid FROM users WHERE uuid = ?",
    [uuid],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Database error");
      }

      if (results.length > 0) {
        const user = results[0];
        return res.json(user);
      } else {
        return res.status(404).send("User not found");
      }
    }
  );
};
