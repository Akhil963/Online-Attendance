const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const PasswordReset = require('../models/PasswordReset');
const { transporter, sendApprovalRequestToAdmin } = require('../utils/emailService');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your_jwt_secret_key', {
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
    try {
      const admins = await Admin.find({ role: 'admin' }, 'email name');
      const adminEmails = admins.map(admin => admin.email);
      
      if (adminEmails.length > 0) {
        await sendApprovalRequestToAdmin(employee, adminEmails);
      }
    } catch (emailError) {
      console.error('Failed to send admin approval email:', emailError);
      // Don't fail registration if email fails
    }

    const token = generateToken(employee._id, employee.role);

    res.status(201).json({
      message: 'Employee registered successfully. Waiting for admin approval.',
      token,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department
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
        { employeeId: identifier },
        { name: identifier }
      ],
      role: 'employee'
    }).populate('department');

    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is approved
    if (!employee.isApproved) {
      return res.status(403).json({ 
        error: 'Your account is pending admin approval. Please wait for approval before you can login.',
        isApprovalPending: true,
        email: employee.email
      });
    }

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
        role: employee.role,
        department: employee.department
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
exports.forgotPassword = async (req, res) => {
  try {
    const { email, userType } = req.body;

    if (!email || !userType) {
      return res.status(400).json({ error: 'Email and user type are required' });
    }

    if (!['employee', 'admin'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Find user
    const Model = userType === 'admin' ? Admin : Employee;
    const user = await Model.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return generic message for security
      return res.status(200).json({
        message: 'If an account exists with this email, a reset link will be sent'
      });
    }

    // Generate reset token
    const { token, tokenHash, expiresAt } = PasswordReset.generateResetToken();

    // Save reset token to database
    await PasswordReset.create({
      userId: user._id,
      userType,
      email: user.email,
      token,
      tokenHash,
      expiresAt
    });

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}&type=${userType}`;

    // Send email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="color: #333; font-size: 16px;">Hello ${user.name},</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to reset it. This link will expire in 24 hours.
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
          <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>

        <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            Or copy and paste this link: <br/>
            <code style="word-break: break-all;">${resetLink}</code>
          </p>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;">
          <p style="margin: 0; font-size: 12px; color: #856404;">
            <strong>Security Note:</strong> If you didn't request this, please ignore this email. Your password won't be changed unless you click the link above.
          </p>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
          Attendance System - Password Reset
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: html
    });

    res.status(200).json({
      message: 'If an account exists with this email, a reset link will be sent'
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reset Password - Verify Token and Update Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword, userType } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Token, password, and confirm password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
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
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    // Find user and update password
    const Model = resetRecord.userType === 'admin' ? Admin : Employee;
    const user = await Model.findById(resetRecord.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password
    user.password = password;
    await user.save();

    // Mark reset token as used
    resetRecord.used = true;
    resetRecord.usedAt = new Date();
    await resetRecord.save();

    // ✅ REAL-TIME UPDATES: Emit socket event for password change
    const io = req.io;
    if (io) {
      // Notify all admin dashboards about password change
      io.emit('user:passwordChanged', {
        userId: user._id.toString(),
        userType: resetRecord.userType,
        userName: user.name,
        email: user.email,
        timestamp: new Date(),
        message: `${user.name} (${resetRecord.userType}) has reset their password`
      });

      // Disconnect all existing sockets for this user (forces re-login)
      const sockets = await io.fetchSockets();
      for (const socket of sockets) {
        if (socket.handshake.auth.userId === user._id.toString()) {
          socket.emit('auth:sessionInvalidated', {
            reason: 'password_changed',
            message: 'Your password was changed. Please log in again.'
          });
          socket.disconnect();
        }
      }
    }

    // Send confirmation email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✓ Password Changed Successfully</h1>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p style="color: #333; font-size: 16px;">Hello ${user.name},</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Your password has been successfully reset. You can now login with your new password.
          </p>
        </div>

        <div style="background: #d4edda; padding: 15px; border-left: 4px solid #28a745; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12px; color: #155724;">
            If this wasn't you, please contact support immediately.
          </p>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
          Attendance System - Password Reset Confirmation
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Confirmation',
      html: html
    });

    res.status(200).json({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ error: error.message });
  }
};

// Verify Reset Token (check if token is valid)
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;

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
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    res.status(200).json({
      valid: true,
      email: resetRecord.email,
      userType: resetRecord.userType
    });
  } catch (error) {
    console.error('Error in verifyResetToken:', error);
    res.status(500).json({ error: error.message });
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