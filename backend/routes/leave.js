const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post('/apply', authMiddleware, leaveController.applyLeave);
router.get('/my-leaves', authMiddleware, leaveController.getMyLeaves);
router.get('/all', authMiddleware, roleMiddleware(['admin', 'manager', 'director']), leaveController.getAllLeaves);
router.post('/approve/:leaveId', authMiddleware, roleMiddleware(['admin', 'manager', 'director']), leaveController.approveLeave);
router.post('/reject/:leaveId', authMiddleware, roleMiddleware(['admin', 'manager', 'director']), leaveController.rejectLeave);

// Unplanned leave routes
router.post('/unplanned/create', authMiddleware, roleMiddleware(['admin', 'manager', 'director']), leaveController.createUnplannedLeave);
router.get('/unplanned/list', authMiddleware, roleMiddleware(['admin', 'manager', 'director']), leaveController.getUnplannedLeaves);

module.exports = router;
