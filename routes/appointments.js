const express = require("express");
const router = express.Router();
const {
  getAppointmentsSchedule,
  createAppointment,
} = require("../controllers/appointmentsController");

router.get("/schedule", getAppointmentsSchedule); // GET /api/appointments/schedule
router.post("/", createAppointment); // POST /api/appointments
module.exports = router;
