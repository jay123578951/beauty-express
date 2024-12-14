const connection = require("../database");

// 取得設計師的預約時段
exports.getAppointmentsSchedule = (req, res) => {
  const { startDate, endDate, stylistId } = req.query;

  // 基本查詢：篩選時間範圍內的預約
  let query = `
    SELECT appointment_date, start_time, end_time
    FROM appointments
    WHERE appointment_date BETWEEN ? AND ?
  `;
  const params = [startDate, endDate];

  if (stylistId) {
    // 如果指定了設計師，篩選該設計師的預約
    query += " AND stylist_id = ?";
    params.push(stylistId);

    // 直接返回該設計師的所有預約時段
    query += " GROUP BY appointment_date, start_time, end_time";
  } else {
    // 如果沒有指定設計師，篩選所有設計師都被預約的時段
    query += `
      GROUP BY appointment_date, start_time, end_time
      HAVING COUNT(DISTINCT stylist_id) = (SELECT COUNT(*) FROM stylists)
    `;
  }

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      stylistId: stylistId || "all",
      appointments: results,
    });
  });
};

// 新增預約 API
exports.createAppointment = async (req, res) => {
  const {
    user_id,
    stylist_id,
    menu_id,
    appointment_date,
    start_time,
    end_time,
  } = req.body;

  // 驗證輸入欄位
  if (!user_id || !menu_id || !appointment_date || !start_time || !end_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 如果 `stylist_id` 為 null，隨機分配有空閒的設計師
    let assignedStylistId = stylist_id;
    if (stylist_id === null) {
      const availableStylistsQuery = `
        SELECT s.id
        FROM stylists s
        WHERE NOT EXISTS (
          SELECT 1
          FROM appointments a
          WHERE a.stylist_id = s.id
            AND a.appointment_date = ?
            AND NOT (? >= a.end_time OR ? <= a.start_time)
        )
        LIMIT 1
      `;

      const [availableStylists] = await connection
        .promise()
        .query(availableStylistsQuery, [
          appointment_date,
          start_time,
          end_time,
        ]);

      if (availableStylists.length === 0) {
        return res
          .status(409)
          .json({ error: "No available stylists for the selected time slot" });
      }

      assignedStylistId = availableStylists[0].id;
    }

    // 檢查是否有重疊的預約
    const checkOverlapQuery = `
      SELECT 1
      FROM appointments
      WHERE stylist_id = ?
        AND appointment_date = ?
        AND NOT (? >= end_time OR ? <= start_time)
    `;

    const [overlap] = await connection
      .promise()
      .query(checkOverlapQuery, [
        assignedStylistId,
        appointment_date,
        start_time,
        end_time,
      ]);

    if (overlap.length > 0) {
      return res.status(409).json({ error: "Time slot is already booked" });
    }

    // 插入新的預約
    const insertQuery = `
      INSERT INTO appointments (id, user_id, stylist_id, menu_id, appointment_date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const { nanoid } = await import("nanoid");
    const appointmentId = nanoid(10); // 隨機生成 10 個字元的 ID

    await connection
      .promise()
      .query(insertQuery, [
        appointmentId,
        user_id,
        assignedStylistId,
        menu_id,
        appointment_date,
        start_time,
        end_time,
      ]);

    res.status(201).json({
      message: "Appointment successfully created",
      appointmentId,
      stylist_id: assignedStylistId,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Database error" });
  }
};
