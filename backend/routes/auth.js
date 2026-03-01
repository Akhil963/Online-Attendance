const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Middleware to attach io instance to request
router.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-token', authMiddleware, authController.verifyToken);
router.get('/me', authMiddleware, authController.getCurrentUser);

// Admin profile update
router.post('/update-admin-profile', authMiddleware, authController.updateAdminProfile);

// Check approval status (public endpoint - no auth required)
router.get('/check-approval/:email', authController.checkApprovalStatus);

// Forgot/Reset Password Routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-reset-token', authController.verifyResetToken);

// Change Password Route (for authenticated users)
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
