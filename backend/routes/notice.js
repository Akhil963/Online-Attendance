const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, roleMiddleware(['admin']), noticeController.createNotice);
router.get('/', authMiddleware, noticeController.getNotices);
router.get('/all', authMiddleware, roleMiddleware(['admin']), noticeController.getAllNotices);
router.put('/:noticeId', authMiddleware, roleMiddleware(['admin']), noticeController.updateNotice);
router.delete('/:noticeId', authMiddleware, roleMiddleware(['admin']), noticeController.deleteNotice);

module.exports = router;
