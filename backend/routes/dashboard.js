const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/employee', authMiddleware, dashboardController.getDashboardData);
router.get('/admin', authMiddleware, roleMiddleware(['admin', 'director']), dashboardController.getAdminDashboard);
router.post('/report', authMiddleware, roleMiddleware(['admin']), dashboardController.generateMonthlyReport);
router.post('/send-report', authMiddleware, roleMiddleware(['admin', 'director']), dashboardController.sendAttendanceReportNow);

module.exports = router;
