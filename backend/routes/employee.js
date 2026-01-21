const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const employeeController = require('../controllers/employeeController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/profile-pictures');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Use userId and timestamp to create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.userId}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/profile', authMiddleware, employeeController.getProfile);
router.put('/profile', authMiddleware, employeeController.updateProfile);
router.post('/profile-picture', authMiddleware, upload.single('profilePicture'), employeeController.uploadProfilePicture);
router.get('/all', authMiddleware, roleMiddleware(['admin', 'manager', 'director']), employeeController.getAllEmployees);
router.get('/:employeeId', authMiddleware, employeeController.getEmployeeById);
router.put('/:employeeId', authMiddleware, roleMiddleware(['admin']), employeeController.updateEmployee);
router.delete('/:employeeId', authMiddleware, roleMiddleware(['admin']), employeeController.deleteEmployee);
router.post('/:employeeId/approve', authMiddleware, roleMiddleware(['admin']), employeeController.approveEmployee);
router.post('/:employeeId/reject', authMiddleware, roleMiddleware(['admin']), employeeController.rejectEmployee);

module.exports = router;
