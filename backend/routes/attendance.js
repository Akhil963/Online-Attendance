const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post('/check-in', authMiddleware, attendanceController.checkIn);
router.post('/check-out', authMiddleware, attendanceController.checkOut);
router.get('/history', authMiddleware, attendanceController.getAttendanceHistory);
router.get('/today', authMiddleware, attendanceController.getTodayAttendance);
router.get('/all', authMiddleware, roleMiddleware(['admin', 'manager', 'director']), attendanceController.getAllAttendance);

module.exports = router;
