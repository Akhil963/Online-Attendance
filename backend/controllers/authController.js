const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const PasswordReset = require('../models/PasswordReset');
const { sendApprovalRequestToAdmin, sendEmailSafe } = require('../utils/emailService');
const { validatePasswordStrength } = require('../utils/passwordValidator');
const { logSecurityEvent, logFailedAttempt, getRecentFailedAttempts } = require('../utils/auditLogger');

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, password, email, phone, employeeId, departmentId, role, gender, adminCode } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({ error: 'Name, password, and role are required' });
    }

    // Admin registration validation
    if (role === 'admin') {
      if (!email) {
        return res.status(400).json({ error: 'Email is required for admin registration' });
      }

      // Validate admin code
      const validAdminCode = process.env.ADMIN_REGISTRATION_CODE;
      if (!validAdminCode) {
        return res.status(500).json({ error: 'Admin registration is not enabled' });
      }

      if (!adminCode || adminCode !== validAdminCode) {
        return res.status(401).json({ error: 'Invalid admin code' });
      }

      // Check if admin with this email already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ error: 'Admin with this email already exists' });
      }

      const admin = new Admin({
        name,
        email,
        password,
        phone: phone || null,
        role: 'admin',
        permissions: [
          'manage_employees',
          'manage_attendance',
          'manage_leaves',
          'manage_notices',
          'manage_departments',
          'view_reports'
        ]
      });

      await admin.save();
      const token = generateToken(admin._id, admin.role);

      return res.status(201).json({
        message: 'Admin registered successfully',
        token,
        admin: {
          id: admin._id,
          adminId: admin.adminId,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    }

    // Employee registration validation
    if (!departmentId) {
      return res.status(400).json({ error: 'Department is required for employee registration' });
    }

    if (!departmentId || departmentId.trim() === '') {
      return res.status(400).json({ error: 'Please select a valid department' });
    }

    // Check if department exists
    const department = await Department.findById(departmentId).catch(() => null);
    if (!department) {
      return res.status(400).json({ error: 'Department not found. Please select a valid department.' });
    }

    // Check if employee with this email already exists (if email is provided)
    if (email) {
      const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
      if (existingEmployee) {
        return res.status(400).json({ error: 'Employee with this email already exists' });
      }
    }

    const employee = new Employee({
      employeeId: employeeId || undefined,
      name,
      email: email?.toLowerCase() || undefined,
      password,
      phone: phone || undefined,
      gender: gender || undefined,
      department: departmentId,
      role: 'employee'
    });

    await employee.save();

    // Populate department for email
    await employee.populate('department');

    // Send approval request email to all admins
    // COMMENTED OUT: Send approval request email (Approval requirement disabled)
    // try {
    //   const admins = await Admin.find({ role: 'admin' }, 'email name');
    //   const adminEmails = admins.map(admin => admin.email);
    //   
    //   if (adminEmails.length > 0) {
    //     await sendApprovalRequestToAdmin(employee, adminEmails);
    //   }
    // } catch (emailError) {
    //   console.error('Failed to send admin approval email:', emailError);
    //   // Don't fail registration if email fails
    // }

    const token = generateToken(employee._id, employee.role);

    res.status(201).json({
      message: 'Employee registered successfully. You can now login.',
      // COMMENTED OUT APPROVAL: was 'Waiting for admin approval'
      token,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
          isApproved: true
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/ID and password are required' });
    }

    // Admin login
    if (role === 'admin') {
      const admin = await Admin.findOne({
        email: identifier
      });

      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (admin.isActive === false) {
        return res.status(403).json({ error: 'Admin account is inactive' });
      }

      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await admin.updateLastLogin();

      const token = generateToken(admin._id, admin.role);

      return res.json({
        message: 'Admin login successful',
        token,
        admin: {
          id: admin._id,
          adminId: admin.adminId,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    }

    // Employee login
    const employee = await Employee.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { employeeId: identifier },
        { name: identifier }
      ],
      role: 'employee'
    }).populate('department');

    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (employee.isActive === false || employee.status === 'inactive') {
      return res.status(403).json({ error: 'Employee account is inactive' });
    }

      // COMMENTED OUT: Check if account is approved (Approval requirement disabled)
      // if (!employee.isApproved) {
      //   return res.status(403).json({ 
      //     error: 'Your account is pending admin approval. Please wait for approval before you can login.',
      //     isApprovalPending: true,
      //     email: employee.email
      //   });
      // }

    const isPasswordValid = await employee.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(employee._id, employee.role);

    res.json({
      message: 'Employee login successful',
      token,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        isApproved: employee.isApproved,
        approvalDate: employee.approvalDate,
        designation: employee.designation,
        phone: employee.phone,
        profilePicture: employee.profilePicture,
        gender: employee.gender,
        joiningDate: employee.joiningDate
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId);
    
    if (admin) {
      return res.json({ user: admin, role: 'admin' });
    }

    const employee = await Employee.findById(req.userId).populate('department');
    
    if (!employee) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: employee, role: 'employee' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify token
exports.verifyToken = (req, res) => {
  res.json({ valid: true, userId: req.userId, userRole: req.userRole });
};

// Forgot Password - Request Reset Link
/**
 * PRODUCTION-GRADE: Request Password Reset with Rate Limiting & Audit Logging
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email, userType } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'UNKNOWN';

    // Validate input
    if (!email || !userType) {
      logFailedAttempt(email || 'UNKNOWN', userType || 'UNKNOWN', 'FORGOT_PASSWORD', ipAddress, 'Missing required fields');
      return res.status(400).json({ error: 'Email and user type are required' });
    }

    if (!['employee', 'admin'].includes(userType)) {
      logFailedAttempt(email, userType, 'FORGOT_PASSWORD', ipAddress, 'Invalid user type');
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ✅ RATE LIMITING: Check for excessive password reset requests (max 3 per 24 hours)
    const recentFailedAttempts = getRecentFailedAttempts(normalizedEmail, userType, 1440); // 24 hours
    const resetAttempts = recentFailedAttempts.filter(a => a.attemptType === 'FORGOT_PASSWORD');
    
    if (resetAttempts.length >= 3) {
      logSecurityEvent(
        'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
        'UNKNOWN',
        userType,
        { email: normalizedEmail, attemptCount: resetAttempts.length },
        ipAddress,
        false
      );
      return res.status(429).json({ 
        error: 'Too many password reset requests. Try again later.' 
      });
    }

    // Find user by email
    const Model = userType === 'admin' ? Admin : Employee;
    const user = await Model.findOne({ email: normalizedEmail });

    // Return error if user not found
    if (!user) {
      logFailedAttempt(normalizedEmail, userType, 'FORGOT_PASSWORD', ipAddress, 'User not found');
      return res.status(404).json({
        error: 'No account found with this email address'
      });
    }

    // ✅ SECURITY: Invalidate previous unused reset tokens
    await PasswordReset.updateMany(
      { userId: user._id, userType, used: false },
      { used: true, usedAt: new Date() }
    );

    // Generate reset token
    const { token, tokenHash, expiresAt } = PasswordReset.generateResetToken();

    // Save reset token to database
    const resetRecord = await PasswordReset.create({
      userId: user._id,
      userType,
      email: user.email,
      token,
      tokenHash,
      expiresAt
    });

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&type=${userType}`;

    // Log security event
    logSecurityEvent(
      'PASSWORD_RESET_REQUEST',
      user._id.toString(),
      userType,
      { email: user.email, resetId: resetRecord._id.toString() },
      ipAddress,
      true
    );

    // Send email with proper content
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; margin-bottom: 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Password Reset Request</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hello ${user.name},</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
            We received a password reset request for your account. Click the button below to reset your password. This link will expire in 24 hours.
          </p>

          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 35px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>

          <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #667eea;">
            <p style="margin: 0; font-size: 12px; color: #666; word-break: break-all;">
              Or copy this link: <br/>
              <code>${resetLink}</code>
            </p>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 12px; color: #856404;">
              <strong>Security Note:</strong> If you did not request this, please ignore this email. Your password will not change unless you click the link above.
            </p>
          </div>

          <div style="background: #f0f0f0; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 11px; color: #888;">
              <strong>Important:</strong> This link is only valid for 24 hours. Please act immediately.
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #999; font-size: 11px; border-top: 1px solid #eee;">
          <p style="margin: 5px 0;">Attendance System - Password Reset</p>
        </div>
      </div>
    `;

    try {
      const msg = {
        to: user.email,
        from: FROM_EMAIL,
        subject: 'Password Reset Request - Attendance System',
        html: html
      };
      await sendEmailSafe(msg);
      console.log(`Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      logSecurityEvent(
        'PASSWORD_RESET_EMAIL_FAILED',
        user._id.toString(),
        userType,
        { email: user.email, error: emailError.message },
        ipAddress,
        false
      );
      // Don't expose email error to client, but log it
    }

    // Return generic success message for security
    res.status(200).json({
      message: 'If an account exists with this email, a reset link will be sent'
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    logSecurityEvent(
      'PASSWORD_RESET_REQUEST_ERROR',
      'UNKNOWN',
      req.body.userType || 'UNKNOWN',
      { error: error.message },
      req.ip,
      false
    );
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
};

/**
 * PRODUCTION-GRADE: Reset Password with Strength Validation & Comprehensive Security
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword, userType } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'UNKNOWN';

    // Validate input
    if (!token || !password || !confirmPassword || !userType) {
      logFailedAttempt('UNKNOWN', userType || 'UNKNOWN', 'RESET_PASSWORD', ipAddress, 'Missing required fields');
      return res.status(400).json({ error: 'Token, password, confirm password, and user type are required' });
    }

    if (password !== confirmPassword) {
      logFailedAttempt('UNKNOWN', userType, 'RESET_PASSWORD', ipAddress, 'Passwords do not match');
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // ✅ SECURITY: Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      logFailedAttempt('UNKNOWN', userType, 'WEAK_PASSWORD', ipAddress, passwordValidation.errors.join('; '));
      return res.status(400).json({ 
        error: 'Password is too weak',
        details: passwordValidation.errors,
        strength: passwordValidation.strength
      });
    }

    // Hash the token to match database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find reset record
    const resetRecord = await PasswordReset.findOne({
      tokenHash: tokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      logFailedAttempt('UNKNOWN', userType, 'RESET_PASSWORD', ipAddress, 'Invalid or expired token');
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    // Find user
    const Model = resetRecord.userType === 'admin' ? Admin : Employee;
    const user = await Model.findById(resetRecord.userId);

    if (!user) {
      logSecurityEvent(
        'PASSWORD_RESET_USER_NOT_FOUND',
        resetRecord.userId.toString(),
        resetRecord.userType,
        { email: resetRecord.email },
        ipAddress,
        false
      );
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ SECURITY: Check if password is same as current password
    const bcrypt = require('bcryptjs');
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      logFailedAttempt(resetRecord.email, resetRecord.userType, 'RESET_PASSWORD', ipAddress, 'New password same as old');
      return res.status(400).json({ 
        error: 'New password must be different from your current password' 
      });
    }

    try {
      // Update password
      user.password = password;
      user.passwordChangedAt = new Date(); // Track when password was last changed
      await user.save();

      // Mark reset token as used
      resetRecord.used = true;
      resetRecord.usedAt = new Date();
      await resetRecord.save();

      // Log successful password reset
      logSecurityEvent(
        'PASSWORD_RESET_SUCCESS',
        user._id.toString(),
        resetRecord.userType,
        { email: user.email, resetId: resetRecord._id.toString() },
        ipAddress,
        true
      );

      // ✅ REAL-TIME: Invalidate all user sessions
      const io = req.io;
      if (io) {
        try {
          // Notify admin dashboards
          io.emit('user:passwordChanged', {
            userId: user._id.toString(),
            userType: resetRecord.userType,
            userName: user.name,
            email: user.email,
            timestamp: new Date(),
            message: `${user.name} (${resetRecord.userType}) has successfully reset their password`
          });

          // Disconnect all user sessions
          const sockets = await io.fetchSockets();
          for (const socket of sockets) {
            if (socket.handshake.auth && socket.handshake.auth.userId === user._id.toString()) {
              socket.emit('auth:sessionInvalidated', {
                reason: 'password_changed',
              message: 'Your password has been successfully reset. Please login with your new password.'
              });
              socket.disconnect(true);
            }
          }
        } catch (socketError) {
          console.error('Error invalidating sessions:', socketError);
        }
      }

      // Send confirmation email
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; margin-bottom: 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">✓ Password Reset Successfully</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hello ${user.name},</p>
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              Your password has been successfully reset. You can now log in with your new password.
            </p>

            <div style="background: #d4edda; padding: 15px; border-left: 4px solid #28a745; border-radius: 4px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 12px; color: #155724;">
                <strong>Important:</strong> If you did not make this change, please contact support immediately.
              </p>
            </div>

            <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #007bff;">
              <p style="margin: 0; font-size: 12px; color: #333;">
                <strong>Password Changed Date & Time:</strong> ${new Date().toLocaleString()}
              </p>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; color: #856404;">
                <strong>Security Tip:</strong> Do not share your password with anyone. Never disclose your account details.
              </p>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 11px; border-top: 1px solid #eee;">
            <p style="margin: 5px 0;">Attendance System - Secure Account</p>
          </div>
        </div>
      `;

      try {
        const msg = {
          to: user.email,
          from: FROM_EMAIL,
          subject: 'Password Reset Successful - Attendance System',
          html: html
        };
        await sendEmailSafe(msg);
        console.log(`Password reset confirmation email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the reset if confirmation email fails
      }

      res.status(200).json({
        message: 'Password has been successfully reset. Please login again.',
        success: true,
        redirectUrl: userType === 'admin' ? '/login/admin' : '/login/employee'
      });
    } catch (passwordError) {
      console.error('Error updating password:', passwordError);
      logSecurityEvent(
        'PASSWORD_RESET_UPDATE_FAILED',
        user._id.toString(),
        resetRecord.userType,
        { error: passwordError.message },
        ipAddress,
        false
      );
      throw passwordError;
    }
  } catch (error) {
    console.error('Error in resetPassword:', error);
    logSecurityEvent(
      'PASSWORD_RESET_ERROR',
      'UNKNOWN',
      req.body.userType || 'UNKNOWN',
      { error: error.message },
      req.ip,
      false
    );
    res.status(500).json({ error: 'An error occurred while resetting password. Please try again.' });
  }
};

/**
 * PRODUCTION-GRADE: Verify Password Reset Token
 */
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    const ipAddress = req.ip || req.connection.remoteAddress || 'UNKNOWN';

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Hash the token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find reset record
    const resetRecord = await PasswordReset.findOne({
      tokenHash: tokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      logFailedAttempt('UNKNOWN', 'UNKNOWN', 'VERIFY_TOKEN', ipAddress, 'Invalid or expired token');
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    // Log token verification
    logSecurityEvent(
      'PASSWORD_RESET_TOKEN_VERIFIED',
      resetRecord.userId.toString(),
      resetRecord.userType,
      { email: resetRecord.email },
      ipAddress,
      true
    );

    res.status(200).json({
      valid: true,
      email: resetRecord.email,
      userType: resetRecord.userType,
      expiresAt: resetRecord.expiresAt
    });
  } catch (error) {
    console.error('Error in verifyResetToken:', error);
    res.status(500).json({ error: 'An error occurred while verifying token.' });
  }
};

/**
 * PRODUCTION-GRADE: Change Password (for authenticated users)
 * Requires: JWT token authentication
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.userId; // From JWT auth middleware
    const userType = req.userRole; // From JWT auth middleware
    const ipAddress = req.ip || req.connection.remoteAddress || 'UNKNOWN';

    // Validate input
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      logFailedAttempt('UNKNOWN', userType, 'CHANGE_PASSWORD', ipAddress, 'New passwords do not match');
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (oldPassword === newPassword) {
      logFailedAttempt('UNKNOWN', userType, 'CHANGE_PASSWORD', ipAddress, 'New password same as old');
      return res.status(400).json({ error: 'New password must be different from the current password' });
    }

    // ✅ SECURITY: Validate password strength for new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      logFailedAttempt('UNKNOWN', userType, 'WEAK_PASSWORD', ipAddress, passwordValidation.errors.join('; '));
      return res.status(400).json({ 
        error: 'New password is too weak',
        details: passwordValidation.errors,
        strength: passwordValidation.strength
      });
    }

    // Find user
    const Model = userType === 'admin' ? Admin : Employee;
    const user = await Model.findById(userId);

    if (!user) {
      logSecurityEvent(
        'CHANGE_PASSWORD_USER_NOT_FOUND',
        userId,
        userType,
        {},
        ipAddress,
        false
      );
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ SECURITY: Verify old password
    const bcrypt = require('bcryptjs');
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordCorrect) {
      logFailedAttempt(user.email, userType, 'CHANGE_PASSWORD', ipAddress, 'Incorrect old password');
      logSecurityEvent(
        'CHANGE_PASSWORD_FAILED',
        userId,
        userType,
        { email: user.email, reason: 'incorrect_password' },
        ipAddress,
        false
      );
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    try {
      // Update password
      user.password = newPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      // Log successful password change
      logSecurityEvent(
        'CHANGE_PASSWORD_SUCCESS',
        userId,
        userType,
        { email: user.email },
        ipAddress,
        true
      );

      // ✅ REAL-TIME: Optionally keep user logged in (don't invalidate session)
      // Or invalidate all other sessions but keep current one
      const io = req.io;
      if (io) {
        try {
          // Notify admin dashboards
          io.emit('user:passwordChanged', {
            userId: user._id.toString(),
            userType: userType,
            userName: user.name,
            email: user.email,
            timestamp: new Date(),
            message: `${user.name} (${userType}) has successfully changed their password`
          });
        } catch (socketError) {
          console.error('Error emitting socket event:', socketError);
        }
      }

      // Send confirmation email
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; margin-bottom: 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">✓ Password Changed Successfully</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 10px;">Hello ${user.name},</p>
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              Your password has been successfully changed.
            </p>

            <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #007bff;">
              <p style="margin: 0; font-size: 12px; color: #333;">
                <strong>Date & Time:</strong> ${new Date().toLocaleString('en-US')}
              </p>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;">
              <p style="margin: 0; font-size: 12px; color: #856404;">
                <strong>Security Notice:</strong> If you did not make this change, please contact support immediately.
              </p>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 11px; border-top: 1px solid #eee;">
            <p style="margin: 5px 0;">Attendance System - Secure Account</p>
          </div>
        </div>
      `;

      try {
        const msg = {
          to: user.email,
          from: FROM_EMAIL,
          subject: 'Password Change Confirmation - Attendance System',
          html: html
        };
        await sendEmailSafe(msg);
        console.log(`Password change confirmation email sent to: ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send password change confirmation email:', emailError);
      }

      res.status(200).json({
        message: 'Password has been successfully changed',
        success: true
      });
    } catch (passwordError) {
      console.error('Error updating password:', passwordError);
      logSecurityEvent(
        'CHANGE_PASSWORD_UPDATE_FAILED',
        userId,
        userType,
        { error: passwordError.message },
        ipAddress,
        false
      );
      res.status(500).json({ error: 'Error updating password. Please try again.' });
    }
  } catch (error) {
    console.error('Error in changePassword:', error);
    logSecurityEvent(
      'CHANGE_PASSWORD_ERROR',
      req.userId || 'UNKNOWN',
      req.userRole || 'UNKNOWN',
      { error: error.message },
      req.ip,
      false
    );
    res.status(500).json({ error: 'Error changing password. Please try again later.' });
  }
};
// Update Admin Profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, phone, gender, address, designation } = req.body;
    const adminId = req.userId;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin not authenticated' });
    }

    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Valid designation values
    const validDesignations = ['CEO', 'CTO', 'MD', 'COO', 'CFO', 'Director', 'Manager', 'Administrator', 'Other'];
    if (designation && !validDesignations.includes(designation)) {
      return res.status(400).json({ error: 'Invalid designation selected' });
    }

    // Build update object
    const updateData = {
      name: name.trim(),
      phone: phone || '',
      gender: gender || '',
      address: address || ''
    };

    if (designation) {
      updateData.designation = designation;
    }

    // Update admin in database
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedAdmin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Log security event
    logSecurityEvent(
      'ADMIN_PROFILE_UPDATE',
      adminId,
      'admin',
      { updatedFields: Object.keys(updateData) },
      req.ip,
      true
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedAdmin
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    logSecurityEvent(
      'ADMIN_PROFILE_UPDATE_ERROR',
      req.userId || 'UNKNOWN',
      'admin',
      { error: error.message },
      req.ip,
      false
    );
    res.status(500).json({ error: 'Failed to update profile. Please try again later.' });
  }
};

// Check approval status (public endpoint - no auth required)
exports.checkApprovalStatus = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const employee = await Employee.findOne({ email: email.toLowerCase() });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({
      isApproved: employee.isApproved,
      name: employee.name,
      email: employee.email,
      employeeId: employee.employeeId,
      approvalDate: employee.approvalDate || null
    });
  } catch (error) {
    console.error('Error checking approval status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Forgot Email - find email by name
exports.forgotEmail = async (req, res) => {
  try {
    const { name, userType } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'UNKNOWN';

    // Validate input
    if (!name || !userType) {
      return res.status(400).json({ error: 'Name and user type are required' });
    }

    if (!['employee', 'admin'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const normalizedName = name.trim();

    // Find user by name (case-insensitive)
    const Model = userType === 'admin' ? Admin : Employee;
    const user = await Model.findOne({ name: { $regex: new RegExp(`^${normalizedName}$`, 'i') } });

    // Return email if found
    if (user) {
      logSecurityEvent(
        'FORGOT_EMAIL_REQUEST',
        user._id.toString(),
        userType,
        { email: user.email },
        ipAddress,
        true
      );

      return res.status(200).json({
        email: user.email,
        message: 'Email found'
      });
    }

    // Return error if not found
    logFailedAttempt(normalizedName, userType, 'FORGOT_EMAIL', ipAddress, 'User not found');
    return res.status(404).json({
      error: 'No account found with this name'
    });

  } catch (error) {
    console.error('Error in forgotEmail:', error);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
};